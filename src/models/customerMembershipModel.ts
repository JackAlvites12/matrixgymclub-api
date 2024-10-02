
import { Schema, model } from 'mongoose'
import { MembershipCustomer } from '../interfaces'



const customerMembershipSchema = new Schema<MembershipCustomer>({

    membresiaId: { type: Schema.Types.ObjectId, ref: 'Membresia' },
    clientId: { type: Schema.Types.ObjectId, ref: 'Cliente' },
    fechaInicio: { type: Date, default: Date.now },
    fechaExpiracion: { type: Date, required: true },
    
})

export const CustomerMembership = model('CustomerMembership', customerMembershipSchema )