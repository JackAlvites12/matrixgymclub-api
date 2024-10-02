import { dbConnection } from './config/db.connection'
import express from 'express' 

export const app = express()
const PORT = process.env.PORT

export const startServer = async () => {

    await dbConnection()

    app.listen( PORT, () => {
        console.log(`Conexión establecia en el puerto: ${ PORT }`)
    })

}