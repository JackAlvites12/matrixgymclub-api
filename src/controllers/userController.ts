import { Request, Response } from "express"
import { User } from "../models/userModel"
import jwt from 'jsonwebtoken'
import { Client } from "../models/clientModel"

export const getAllUsers = async ( req: Request, res: Response ) => {

    try {

        const users = await User.find()

        if( !users ) return res.status( 400 ).json({ message: 'No se encontraron usuarios registrados' })
        
        return res.status( 200 ).json( users )

    } catch (error) {

        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })

    }

}

export const signUp = async ( req: Request, res: Response ) => {

    const { username, email, password } = req.body

    try {
        
        // Validaciones 
        const existsUsername = await User.findOne({ username })
        if( existsUsername ) return res.status( 400 ).json({ type:'user-duplicate', message: 'Usuario existente, digite uno diferente' })
        
        const existsUserEmail = await User.findOne({ email })
        if( existsUserEmail ) return res.status( 400 ).json({ type:'email-duplicate', message: 'Correo existente, digite uno diferente' })


        // 
        const newUser = new User({ username, email, password })
        const newUserId = newUser._id.toString()

        newUser.password = await newUser.encryptPassword( password )
        
        await newUser.save()

        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY as string, { expiresIn: '24h' })

        res.cookie('token', token, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true, sameSite: 'lax' })
        res.cookie('userId', newUserId, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true, sameSite: 'lax' })
        
        return res.status( 201 ).json({ message: 'Usuario creado correctamente', newUser })

    } catch (error) {

        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })
        
    }

}

export const login = async ( req: Request, res: Response) => {

    const { email, password } = req.body

    try {
        
        // Verificar email 
        const user = await User.findOne({ email })

        const userId = user?._id.toString()
        if( !user ) return res.status( 401 ).json({ message: 'Email y/o Contraseña inválidos' })

        // Verificar password

        const validatePassword = await user.validatePassword( password )
        if( !validatePassword ) return res.status( 401 ).json({ message: 'Email y/o Contraseña inválidos' })

        // Verificado los dos generamos un token de acceso 

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY as string, { expiresIn: '24h' })

        // Verificamos si dicho usuario ya es un cliente 

        const client = await Client.findOne({ userId })

        // True si es cliente false si no lo es 
        const isClient = !!client

        // Generamos cookies | userId para poder almacenarlo al registrar cliente
        res.cookie('token', token, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true, sameSite: 'lax' })
        res.cookie('userId', userId, { maxAge: 60* 60 * 24 * 1000, httpOnly: true, sameSite: 'lax' })

        const bodyUser = {

            _id: userId,
            email: user.email,
            username: user.username,
            isClient,

        }

        return res.status( 200 ).json({ message: 'Autenticado correctamente', bodyUser })
        
    } catch (error) {
        
        return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Inténtalo más tarde' })
        
    }

}

export const logout = async ( req: Request, res: Response ) => {

    try {
        
        res.clearCookie('token')
        res.clearCookie('userId')

        return res.status( 200 ).json({ message: 'Sesión terminada!' })

    } catch (error) {
        return res.status(500).json({ error: 'Hubo un error en el servidor. Inténtelo más tarde.' })
    }

}