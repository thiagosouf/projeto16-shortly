import { Router } from 'express';
import { postShorten, getId, getShortUrl, deleteId } from '../controllers/urlsController.js';

const urlsRouter = Router();

urlsRouter.post('/urls/shorten', postShorten);
urlsRouter.get('/urls/:id', getId);
urlsRouter.get('/urls/open/:shortUrl', getShortUrl);
urlsRouter.delete('/urls/:id', deleteId);

export default urlsRouter;