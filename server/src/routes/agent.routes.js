import { Router } from "express";
import {
  agentLogin,

} from "../controllers/agent.controller.js";



const agentRoute = Router();
agentRoute.route("/login").post(agentLogin);


export default agentRoute