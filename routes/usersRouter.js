import { Router } from "express";
import { getUsers, getRanking } from "../controllers/usersController.js";

const usersRouter = Router();

usersRouter.get("/users/:id", getUsers);
usersRouter.get("/ranking", getRanking);

export default usersRouter;