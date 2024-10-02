import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware'
import { getAllUsers, login, logout, signUp } from '../controllers/userController'

const router = express.Router()

router.get('/', authMiddleware, getAllUsers )

router.post('/signup', signUp )

router.post('/login', login )

router.get('/logout', logout )

export { router as userRouter }

