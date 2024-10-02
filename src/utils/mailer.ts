import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'jackprogramador12@gmail.com',
        pass: process.env.MAILER_KEY,
    }
})