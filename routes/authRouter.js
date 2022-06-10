import { Router } from 'express';
import { postSignup, postSignin } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/signup', postSignup);
authRouter.post('/signin', postSignin);

export default authRouter; 