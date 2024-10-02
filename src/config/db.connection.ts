import mongoose from "mongoose"



export const dbConnection = async () => {
    
    try {

        await mongoose.connect( process.env.MONGO_URI as string )
        console.log('Conexión exitosa con MongoDB');
        

    } catch (error) {

        console.log(`Error al conectarse con MongoDB: ${ error }`);
        process.exit(1)
    }
}