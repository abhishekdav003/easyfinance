import { Router } from "express";
import {
  agentLogin,
  agentAddLoan,
  searchClientByLoanNumber,
  collectPayment,
  getAllClients,
  getClientDetails,
  getMyCollections,
} from "../controllers/agent.controller.js";
import { authenticateAgent } from "../middlewares/authenticateAgent.js"; // Import the new agent auth middleware

const agentRoute = Router();

// Agent login route (no authentication needed)
agentRoute.route("/login").post(agentLogin);

// Add a new loan (protected route, requires authentication)
agentRoute.route("/addloan").post(authenticateAgent, agentAddLoan);

// Search a customer by their unique loan number (protected route, requires authentication)
agentRoute
  .route("/loan/:loanNumber")
  .get(authenticateAgent, searchClientByLoanNumber);

// Record a collection (protected route, requires authentication)
agentRoute.route("/collectpayment").post(authenticateAgent, collectPayment);

// Get all clients in the system (protected route, requires authentication)
agentRoute.route("/clients").get(authenticateAgent, getAllClients);

// Get single client details by loan ID (protected route, requires authentication)
agentRoute.route("/client/:id").get(authenticateAgent, getClientDetails);

// Get all collections made by this agent (protected route, requires authentication)
agentRoute.route("/collections").get(authenticateAgent, getMyCollections);

export default agentRoute;
