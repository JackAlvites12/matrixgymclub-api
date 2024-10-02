import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'


export const authMiddleware = ( req: Request, res: Response, next: NextFunction ) => {

    const { token } = req.cookies  

    if( !token ) return res.status( 401 ).json({ message: 'Tienes que iniciar sesión o registrarte para poder continuar.' })
    
    try {
        
        // Almacenar el valor que nos devuelve el .verify que podríamos usar después en el perfil de usuario
        const decoded = jwt.verify( token, process.env.SECRET_KEY as string ) as JwtPayload
        // req.userId = decoded.id
        next()

    } catch (error) {

        return res.status(500).json({ error: 'No estás autorizado' })
        
    }

}