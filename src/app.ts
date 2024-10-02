import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { clientRouter } from "./routes/clientRoutes"
import { app, startServer } from "./server"
import { userRouter } from './routes/userRoutes'
import { paymentRouter } from './routes/paymentRoutes'
import { stripeRoute } from './routes/stripeRoute'


( async () => {
    
    
    app.use( cors({
        origin: 'https://matrixgymclub-app.vercel.app',
        credentials: true,
    }))
    
    app.use( cookieParser() )
    app.use('/api/stripe', stripeRoute )
    
    app.use( express.urlencoded({ extended: false }))

    await startServer()
    
    app.use( express.json())
    app.use('/api/checkout', paymentRouter )
    app.use('/api', clientRouter )
    app.use('/api/users', userRouter )
    
})()