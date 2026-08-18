import { Router } from 'express'
import { getMe, postLogin, postLogout, postRegister } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const authRouter: Router = Router()

authRouter.post('/register', postRegister)
authRouter.post('/login', postLogin)
authRouter.post('/logout', postLogout)
authRouter.get('/me', requireAuth, getMe)
