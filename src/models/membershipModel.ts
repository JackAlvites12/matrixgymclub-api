import { model, Schema } from 'mongoose'
import { Membresia } from '../interfaces/'

const membershipSchema = new Schema<Membresia>({
    
    congelacion: { type: Boolean, required: true },
    clasesIncluidas: { type: [ String ] },
    tipo: { type: String, enum: ['Nuevo', 'Renovación', 'Reinscripción', 'Recuperado'], required: true }, 
    duracion: { type: String, required: true },
    costo: { type: Number, required: true },
    clientes: [{ type: Schema.Types.ObjectId, ref: 'Cliente'}],
    
})

export const Membership = model('Membresia', membershipSchema)