import { Client } from "../models/clientModel";

export const generateUniqueCode = async () => {

    let uniqueCode;
    let exists;

    do {
        // Generamos un código aleatorio de 5 dígitos
        uniqueCode = Math.floor(10000 + Math.random() * 90000).toString();

        // Verificamos si ya existe en la base de datos
        exists = await Client.findOne({ codigo: uniqueCode });

    } while (exists); // Repetimos si el código ya existe

    return uniqueCode; // Retornamos el código único
};