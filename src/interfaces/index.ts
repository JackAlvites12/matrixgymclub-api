import { Types } from "mongoose"

export interface Usuario {

    username: string, 
    email: string,
    password: string,
    encryptPassword: ( password: string ) => string,
    validatePassword: ( password: string ) => boolean,

}

export interface Cliente {
    codigo: number,
    userId: Types.ObjectId | Usuario,
    nombre: string,
    apellido: string,
    fechaNacimiento: Date,
    edad: number,
    docIdentidad: number,
    genero: string
    domicilio: string,
    distrito: string,
    telefono: string,
}

export interface Membresia {
    congelacion?: boolean,
    clasesIncluidas: string[],
    tipo: TipoMembresia,
    duracion: string,
    costo: number,
    clientes: Types.ObjectId[],
}

export interface MembershipCustomer {
    membresiaId: Types.ObjectId | Membresia,
    clientId: Types.ObjectId,
    fechaInicio: Date,
    fechaExpiracion: Date,
}

export interface Transaccion {
    clientId: Types.ObjectId,
    membresiaId: Types.ObjectId,
    metodo: string,
    moneda: string,
    monto_total: number,
    estado: string,
    fecha: string,
}

type TipoMembresia = 'Nuevo' | 'Renovación' | 'Reinscripción' | 'Recuperado'

