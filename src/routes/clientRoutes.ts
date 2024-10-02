import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { createCustomer, createMembership, findCustomerData, getAllMemberships, getMembershipById, selectMembership } from '../controllers/clientRoutes'

const router = express.Router()

router.get('/memberships', authMiddleware, getAllMemberships )

router.get('/memberships/:id', authMiddleware, getMembershipById )

router.post('/register-membership', authMiddleware, createMembership )

router.post('/select-membership', selectMembership )

router.post('/register-client', authMiddleware, createCustomer )

router.get('/client/:userId', authMiddleware, findCustomerData )


export { router as clientRouter }