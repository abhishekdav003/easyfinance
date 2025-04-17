import { Router } from "express";
import {registerClient} from "../controllers/client.controller.js";

const clientRouter = Router();

clientRouter.route("/register").post(registerClient);

export default clientRouter;
