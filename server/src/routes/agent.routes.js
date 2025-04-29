import { Router } from "express";
import {
  agentLogin,
  agentLogout,
  collectEMI

} from "../controllers/agent.controller.js";
import{
  clientList,
  clientDetails
}from "../controllers/admin.controller.js"
import { verifyAgentJwt } from "../middlewares/agentauth.middleware.js";



const agentRoute = Router();
agentRoute.route("/login").post(agentLogin);



//secuted routes for agents
agentRoute.route("/logout").post(verifyAgentJwt , agentLogout);
agentRoute.route("/allclients").get(verifyAgentJwt , clientList) 
agentRoute.route("/getClientdata/:clientId").get(verifyAgentJwt , clientDetails) 
agentRoute.route("/collectemi/:clientId/:loanId").post(verifyAgentJwt , collectEMI); 


export default agentRoute




