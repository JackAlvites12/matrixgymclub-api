import { Request, Response } from "express"
import { User } from "../models/userModel"
import Stripe from "stripe"
import mongoose from 'mongoose'
import dayjs from 'dayjs'
import axios from 'axios'

import { Membership } from '../models/membershipModel'
import { Transaction } from '../models/transactionModel'
import { Client } from '../models/clientModel'
import { EmailTemplate } from '../components/EmailTemplate'
import { transporter } from '../utils/mailer'
import { render } from '@react-email/components'
import { CustomerMembership } from '../models/customerMembershipModel'
import { generateUniqueCode } from '../utils/generateUniqueCode'

// Instanciamos a la clase de Stripe
const stripe = new Stripe( process.env.STRIPE_SECRET_KEY as string )

export const createCheckout = async ( req: Request, res: Response ) => {

    // Extraemos el userId de las cookies

    const { userId, membership_id, client } = req.cookies

    const { duracion, costo } = req.body


    const membershipThreeMonthsURL = 'https://firebasestorage.googleapis.com/v0/b/matrixgym-club.appspot.com/o/membership-3-months.png?alt=media&token=aeae7e73-94bd-42a6-91e9-8044749be2f4'
    const membershipSixMonthsURL = 'https://firebasestorage.googleapis.com/v0/b/matrixgym-club.appspot.com/o/membership-6-months.png?alt=media&token=3393fd09-86e7-45e2-b4fb-190f60ae5e22'
         
    try {

        const user = await User.findById( userId )

        // Creamos una sesión de Stripe

        const session = await stripe.checkout.sessions.create({

            success_url: 'http://localhost:3001/success',
            cancel_url: 'http://localhost:3001/cancel',
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Membresía',
                        description: duracion,
                        images: [ duracion === '6 meses' ? membershipSixMonthsURL : membershipThreeMonthsURL ]
                    },
                    unit_amount: costo * 100,
                },
                quantity: 1
            }],

            mode: 'payment',
            customer_email: user?.email,
            metadata: {
                membershipId: membership_id,
                client,
                userId,
            },

        })

        // Limpiar cookies... 
        res.clearCookie('client')
        res.clearCookie('membership_id')

        
        return res.status( 200 ).json({ message: 'Pago recibido correctamente', session })
        
    } catch (error) {

        return res.status( 500 ).json({ message: 'Hubo un error en el servidor. Inténtelo más tarde' })

    }

}

export const stripeWebhook = async ( req: Request, res: Response ) => {

    const sig = req.headers['stripe-signature'] as string

    const body = req.body

    let event;

    try {

      event = stripe.webhooks.constructEvent( body, sig, process.env.SIGN_IN_SECRET as string );
    
    } catch (error) {
        
        return res.status( 500 ).json({ error })
       
    }

    switch ( event.type ) {

        case 'checkout.session.completed':

            const checkoutSessionCompleted = event.data.object;
            const { metadata, 
                    currency, 
                    amount_total,
                    payment_method_types,
                    payment_status,
                    created,
                    customer_details
                  } = checkoutSessionCompleted
   
            
            if( !metadata || !amount_total || !currency ) return

            // Extraemos el objeto JSON de la metadata que mandamos y convertimos a objeto JS
            const bodyClient = JSON.parse( metadata.client )

            // Creamos un codigo unico para el cliente
            const codigo = await generateUniqueCode()

            // Creamos una instancia con el cuerpo del cliente almacenado en la metadata
            const newClient = new Client({...bodyClient, codigo })

            
            await newClient.save()
            
            // Convertimos el clientId en ObjectId porque lo estamos mandando como un hacia mi servidor 
            const convertClientId = new mongoose.Types.ObjectId( newClient._id )
            const convertDate = new Date( created * 1000 )

            
            // Buscamos la membresia para poder actualizar su arreglo de clientes
            const membership = await Membership.findById( metadata.membershipId )

            if( !membership ) return res.status( 400 ).json({ message: `No se encontró la membresía con id: ${ metadata.membershipId }`})

            membership.clientes.push( convertClientId )

            await membership.save()

            //
            const transaccion = new Transaction({

                clientId: convertClientId,
                membresiaId: metadata.membershipId,
                metodo: payment_method_types[0],
                moneda: currency,
                monto_total: amount_total / 100,
                estado: (payment_status === 'paid' ? 'Pagado' : 'Pendiente'),
                fecha: convertDate,

            })

            await transaccion.save()

            
            // Aqui extraemos el número de mi cadena de texto duracion 
            const duracionMeses = parseInt(membership.duracion.match(/\d+/)?.[0] || '0')
        
            // Podriamos ver la zona horaria en el frontend con mi función convertToPeruTime
            const fechaInicio = new Date()
            const fechaExpiracion = dayjs(fechaInicio).add(duracionMeses, 'month').toDate()

            const customerMembership = new CustomerMembership({
                clientId: convertClientId,
                membresiaId: metadata.membershipId,
                fechaInicio,
                fechaExpiracion,
            })
            
            

            await customerMembership.save()

            // Enviar correo aquí :)

            const bodyMembershipToEmail = {
                titulo: 'Membresia ' + membership.duracion,
                congelacion: ( membership.congelacion ? 'Con freezing' : 'Sin freezing'),
                clases: membership.clasesIncluidas,
                tipo: membership.tipo,
                duracion: membership.duracion,
            }
            
            const propsToEmail = {
                codigo,
                transactionId: transaccion._id,
                cliente: `${ newClient.nombre } ${ newClient.apellido }`,
                producto: bodyMembershipToEmail,
                precio: amount_total / 100,
            }

            const emailHtml = await render( EmailTemplate( propsToEmail ) );

            const data = await transporter.sendMail({
                from: 'jackprogramador12@gmail.com',
                to: customer_details?.email as string,
                subject: 'Gracias por tu preferencia, MatrixGym Club',
                html: emailHtml,

            })


            break;

        case 'checkout.session.expired':
            const sessionExpired = event.data.object;
            
            

        default:
            return 
    }


    return res.status( 200 ).json({ message: 'Recibiendo Webhook' })
    
}

// PAYPAL 
export const createOrder = async ( req: Request, res: Response ) => {

    const { costo } = req.body

    // Aqui sacamos el costo del body porque le pasamos una membresia... esto veremos luego porque simplemente pud8imos haber hecho 
    // buscar el id de la membresia y nada mas pero que mas da debemos seguoir nomas 

    const order = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: costo,
                }
            }

        ],
        payment_source: {
            paypal: {
                experience_context: {
                    payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                    brand_name: 'MatrixGym Club',
                    landing_page: 'NO_PREFERENCE',
                    user_action: 'PAY_NOW',
                    return_url: 'https://matrixgymclub-api.up.railway.app/api/checkout/capture-order',
                    cancel_url: 'http://localhost:3001/cancel',
                }
            }
        }
    }
    
    // Tenemos que conceder nuestras credenciales para que me permitan el acceso a solicitudes en el API REST de paypal, si sale todo bien me 
    // devolverán un objeto grande donde solo nos interesa el token de acceso.
    const params = new URLSearchParams()
    params.append('grant_type', 'client_credentials')

    const { data: { access_token } } = await axios.post(`${ process.env.PAYPAL_API_URI }/v1/oauth2/token`, params, {
        
        auth: {
            username: process.env.PAYPAL_CLIENT_ID as string,
            password: process.env.PAYPAL_CLIENT_SECRET as string,
        }

    })

    // Hacemos nuestro POST para crear una orden 

    const { data } = await axios.post(`${ process.env.PAYPAL_API_URI }/v2/checkout/orders`, order, {

        headers: {
            Authorization: `Bearer ${ access_token }`
        }

    })


    return res.status( 200 ).json( data.links[1].href )
}

export const captureOrder = async ( req: Request, res: Response ) => {

    // Aqui es donde ya podemos añadir todo lo que esta en nuestro webhook por ejemplo. 

    const { membership_id, client, userId } = req.cookies
    const { token } = req.query

    const { data } = await axios.post(`${ process.env.PAYPAL_API_URI }/v2/checkout/orders/${ token }/capture`, {}, {
        
        auth: {
            username: process.env.PAYPAL_CLIENT_ID as string,
            password: process.env.PAYPAL_CLIENT_SECRET as string,
        }

    })

    const bodyClient = JSON.parse( client )

    // Creamos un codigo unico para el cliente
    const codigo = await generateUniqueCode()

    // Creamos una instancia con el cuerpo del cliente almacenado en la metadata
    const newClient = new Client({...bodyClient, codigo })

    
    await newClient.save()
    
    // Convertimos el clientId en ObjectId porque lo estamos mandando como un hacia mi servidor 
    const convertClientId = new mongoose.Types.ObjectId( newClient._id )
    const convertDate = new Date( data.purchase_units[0].payments.captures[0].create_time )

    const unixTimestampSeconds = Math.floor(convertDate.getTime() / 1000);
    
    // Buscamos la membresia para poder actualizar su arreglo de clientes
    const membership = await Membership.findById( membership_id )

    if( !membership ) return res.status( 400 ).json({ message: `No se encontró la membresía con id: ${ membership_id }`})

    membership.clientes.push( convertClientId )

    await membership.save()

    //
    const transaccion = new Transaction({

        clientId: convertClientId,
        membresiaId: membership_id,
        metodo: 'Paypal',
        moneda: data.purchase_units[0].payments.captures[0].amount.currency_code,
        monto_total: data.purchase_units[0].payments.captures[0].amount.value,
        estado: 'Pagado',
        fecha: new Date( unixTimestampSeconds * 1000 ),

    })

    await transaccion.save()

    
    // Aqui extraemos el número de mi cadena de texto duracion 
    const duracionMeses = parseInt(membership.duracion.match(/\d+/)?.[0] || '0')

    // Podriamos ver la zona horaria en el frontend con mi función convertToPeruTime
    const fechaInicio = new Date()
    const fechaExpiracion = dayjs(fechaInicio).add(duracionMeses, 'month').toDate()

    const customerMembership = new CustomerMembership({
        clientId: convertClientId,
        membresiaId: membership_id,
        fechaInicio,
        fechaExpiracion,
    })
     

    await customerMembership.save()

    // Enviar correo aquí :)

    const bodyMembershipToEmail = {
        titulo: 'Membresia ' + membership.duracion,
        congelacion: ( membership.congelacion ? 'Con freezing' : 'Sin freezing'),
        clases: membership.clasesIncluidas,
        tipo: membership.tipo,
        duracion: membership.duracion,
    }

    const user = await User.findById( userId )

    
    const propsToEmail = {
        codigo,
        transactionId: transaccion._id,
        cliente: `${ newClient.nombre } ${ newClient.apellido }`,
        producto: bodyMembershipToEmail,
        precio: data.purchase_units[0].payments.captures[0].amount.value,
    }

    const emailHtml = await render( EmailTemplate( propsToEmail ) );

    const data2 = await transporter.sendMail({
        from: 'jackprogramador12@gmail.com',
        to: user?.email as string,
        subject: 'Gracias por tu preferencia, MatrixGym Club',
        html: emailHtml,

    })

    // Limpiar cookies... 
    res.clearCookie('client')
    res.clearCookie('membership_id')
    
    return res.status( 200 ).redirect('http://localhost:3001/success')

}