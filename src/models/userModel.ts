import { Schema, model } from "mongoose"
import { Usuario } from "../interfaces"
import bcrypt from "bcrypt"

const userSchema = new Schema<Usuario>({

    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },

})

userSchema.methods.encryptPassword = async ( password: string ): Promise<string> => {

    const salt = await bcrypt.genSalt( 10 )
    return await bcrypt.hash( password, salt )
}

userSchema.methods.validatePassword = async function ( password: string ): Promise<Boolean>{

    return await bcrypt.compare( password, this.password )

} 

export const User = model('Usuario', userSchema )