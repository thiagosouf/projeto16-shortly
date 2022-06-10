import { Router } from 'express';
import { postSignup, postSignin } from '../controllers/authController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import cadastroSchema from '../schemas/cadastroSchema.js';
import loginSchema from '../schemas/loginSchema.js';

const authRouter = Router();

authRouter.post('/signup', validateSchema(cadastroSchema), postSignup);
authRouter.post('/signin',  validateSchema(loginSchema), postSignin);

export default authRouter; 