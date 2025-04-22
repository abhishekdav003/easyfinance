import { Router } from "express";
import {
  agentLogin,
  agentLogout

} from "../controllers/agent.controller.js";
import { verifyAgentJwt } from "../middlewares/agentauth.middleware.js";



const agentRoute = Router();
agentRoute.route("/login").post(agentLogin);
agentRoute.route("/logout").post(verifyAgentJwt , agentLogout);


export default agentRoute