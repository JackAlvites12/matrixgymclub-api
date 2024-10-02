import express from 'express'
import { captureOrder, createCheckout, createOrder } from '../controllers/checkoutController'

const router = express.Router()


router.post('/', createCheckout )
router.post('/create-order', createOrder )
router.get('/capture-order', captureOrder )


export { router as paymentRouter }