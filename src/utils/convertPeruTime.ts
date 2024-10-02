import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayjs from 'dayjs'

export const convertPeruTime = ( isoDate: Date ) => {

    // Cargar los plugins para trabajar con UTC y zonas horarias
    dayjs.extend(utc);
    dayjs.extend(timezone);

    // Trabajamos con el tiempo universal coordinado del Date que le pasemos y lo convertimos 
    return dayjs.utc(isoDate).tz('America/Lima').format('DD-MM-YYYY');  //O format('YYYY-MM-DD HH:mm:ss');
}