import { Router } from "express";
import {agentAddLoan, agentLogin} from "../controllers/agent.controller.js";
import { authenticateAgent } from "../middlewares/agentauth.middleware.js";

const agentRoute = Router();

agentRoute.route("/login").post(authenticateAgent , agentLogin);
agentRoute.route("/addloan").post(agentAddLoan);

export default agentRoute;
