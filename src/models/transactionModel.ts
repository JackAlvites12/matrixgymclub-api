import { Schema, model } from 'mongoose'
import { Transaccion } from '../interfaces'

const transactionSchema = new Schema<Transaccion>({
    
    clientId: { type: Schema.Types.ObjectId, ref: 'Cliente' },
    membresiaId: { type: Schema.Types.ObjectId, ref: 'Membresia'},
    metodo: { type: String, required: true },
    moneda: { type: String, required: true },
    monto_total: { type: Number, required: true },
    estado: { type: String, required: true },
    fecha: { type: String, required: true  }

})

export const Transaction = model('Transaccion', transactionSchema)