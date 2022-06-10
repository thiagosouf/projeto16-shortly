import { Router } from 'express';
import { postShorten, getId, getShortUrl, deleteId } from '../controllers/urlsController.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import urlSchema from '../schemas/urlSchema.js';

const urlsRouter = Router();

urlsRouter.post('/urls/shorten', validateSchema(urlSchema), postShorten);
urlsRouter.get('/urls/:id', getId);
urlsRouter.get('/urls/open/:shortUrl', getShortUrl);
urlsRouter.delete('/urls/:id', deleteId);

export default urlsRouter;