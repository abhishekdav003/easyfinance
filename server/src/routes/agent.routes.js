import { Router } from "express";
import {
  agentLogin,
  agentLogout,
  collectEMI,
  AgentaddClient,
  searchClients,
} from "../controllers/agent.controller.js";
import{
  clientList,
  clientDetails,
  
}from "../controllers/admin.controller.js"
import { verifyAgentJwt } from "../middlewares/agentAuth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";



const agentRoute = Router();
agentRoute.route("/login").post(agentLogin);



//secuted routes for agents
agentRoute.route("/logout").post(verifyAgentJwt , agentLogout);
agentRoute.route("/allclients").get(verifyAgentJwt , clientList) 
agentRoute.route("/getClientdata/:clientId").get(verifyAgentJwt , clientDetails) 
agentRoute.route("/collectemi/:clientId/:loanId").post(verifyAgentJwt , collectEMI); 
agentRoute.route("/addclient").post(upload.single("file"), verifyAgentJwt, AgentaddClient) 
agentRoute.route("/search-clients").get(verifyAgentJwt, searchClients);


export default agentRoute




