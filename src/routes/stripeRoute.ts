import express from 'express'
import { stripeWebhook } from '../controllers/checkoutController'


const router = express.Router()

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook )

export { router as stripeRoute }