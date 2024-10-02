import { Request, Response } from "express"
import { Membership } from "../models/membershipModel"
import { Client } from "../models/clientModel"
import { Membresia, Usuario } from "../interfaces"
import { CustomerMembership } from "../models/customerMembershipModel"
import { Transaction } from "../models/transactionModel"
import { convertPeruTime } from "../utils/convertPeruTime"

export const getAllMemberships = async ( req: Request, res: Response ) => {

    try {

        const memberships = await Membership.find() 
        
        if( !memberships ) return res.status( 400 ).json({ message: 'No se encontraron membresías' })

        return res.status( 200 ).json( memberships )

    } catch (error) {

        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })

    }

}

export const getMembershipById = async ( req: Request, res: Response ) => {

    const { id } = req.params

    try {

        const membershipById = await Membership.findById( id )

        if( !membershipById ) return res.status( 400 ).json({ message: `No se encontró la membresía con el id: ${ id }` })
        
        return res.status( 200 ).json( membershipById )

    } catch (error) {

        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })
        
    }

}

export const createMembership = async ( req: Request, res: Response ) => {
    
    const dataMembership = req.body

    try {
        
        await Membership.create( dataMembership )

        return res.status( 201 ).json({ message: 'Membresía creada correctamente' })

    } catch (error) {
        
        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })

    
    }
}

export const selectMembership = async ( req: Request, res: Response ) => {

    try {

        const { _id: membershipId } = req.body

        res.cookie( 'membership_id', membershipId, { 
            maxAge: 60 * 60 * 24 * 1000, 
        })
        

        return res.status(200).json({ message: 'Membresía seleccionada' })

    } catch (error) {

        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })

    }

}

export const createCustomer = async ( req: Request, res: Response ) => {
    
    const { userId } = req.cookies
    const dataClient = req.body

    try {

        const newClient = new Client( dataClient )
        newClient.userId = userId

        
        res.cookie('client', JSON.stringify( newClient ), { 
            maxAge: 60 * 60 * 24 * 1000, 
            // sameSite: 'lax' predeterminada 
        })

        
        return res.status( 201 ).json({ message: 'Cliente registrado' })
        
    } catch (error) {

        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })

    }
}

export const findCustomerData = async( req: Request, res: Response ) => {
    
    const { userId } = req.params

    try {

        const client = await Client.findOne({ userId }).populate('userId')
        
        if( !client ) return res.status( 400 ).json({ message: 'El cliente no existe.' })

        const { _id, codigo, userId: populatedUser, nombre, 
                apellido, fechaNacimiento, edad, docIdentidad,
                genero, domicilio, distrito, telefono } = client

        // Indicar a typescript que el populatedUser será de tipo Usuario para que no me de problemas en acceder propiedades del objeto populado
        const user = populatedUser as Usuario

        // Extraer información de la membresía seleccionada
        
        const customerMembership = await CustomerMembership.findOne({ clientId: _id }).populate('membresiaId')

        if( !customerMembership ) return res.status( 400 ).json({ message: 'La membresía del cliente no existe.'})

        const { membresiaId: populatedMembership, fechaInicio, fechaExpiracion  } = customerMembership

        const membership = populatedMembership as Membresia

        // Extraer información de su transacción | Podemos reemplazar buscar por un ID unico a buscar por el nombre del cliente... 
        // Esto nos puede traer todas las transacciones que hizo dicho cliente. para que no me retorna una sola. 
        const customerTransaction = await Transaction.findOne({ clientId: _id })

        if( !customerTransaction ) return res.status( 400 ).json({ message: 'La transacción del cliente no existe.' })

        const { _id: transactionId, metodo, moneda, monto_total, estado, fecha } = customerTransaction

        
        const bodyClient = {
            _id,
            codigo,
            nombre,
            apellido, 
            fechaNacimiento,
            edad,
            docIdentidad,
            genero,
            domicilio,
            distrito,
            telefono,
            userData: {
                username: user.username,
                email: user.email
            },
            membershipData: {
                congelacion: membership.congelacion,
                clasesIncluidas: membership.clasesIncluidas,
                tipo: membership.tipo,
                costo: membership.costo,
                duracion: membership.duracion,
                fechaInicio: convertPeruTime(fechaInicio),
                fechaExpiracion: convertPeruTime(fechaExpiracion),
            },
            transactionData: {
                transactionId,
                metodo,
                moneda, 
                monto_total,
                estado,
                fecha
            }
        }

        
        return res.status( 200 ).json( bodyClient )
        

    } catch (error) {

        return res.status( 500 ).json({ error: 'Hubo un error en el servidor. Inténtelo más tarde.' })
        
    }
}