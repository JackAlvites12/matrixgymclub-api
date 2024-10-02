import { model, Schema } from 'mongoose'
import { Cliente } from '../interfaces'


const clientSchema = new Schema<Cliente>({
    
    codigo: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    nombre: { type: String, required: true }, 
    apellido: { type: String, required: true }, 
    fechaNacimiento: {  type: Date, required: true },
    edad: { type: Number, required: true },
    docIdentidad: { type: Number, required: true },
    genero: { type: String, required: true },
    domicilio: { type: String, required: true },
    distrito: { type: String, required: true },
    telefono: { type: String, required: true },

})

export const Client = model('Cliente', clientSchema)