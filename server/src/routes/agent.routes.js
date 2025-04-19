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



const agentRoute = Router();
agentRoute.route("/login").post(agentLogin);

// Add a new loan (protected route, requires authentication)
agentRoute.route("/addloan").post( agentAddLoan);

// Search a customer by their unique loan number (protected route, requires authentication)
agentRoute
  .route("/loan/:loanNumber")
  .get( searchClientByLoanNumber);

// Record a collection (protected route, requires authentication)
agentRoute.route("/collectpayment").post( collectPayment);

// Get all clients in the system (protected route, requires authentication)
agentRoute.route("/clients").get( getAllClients);

// Get single client details by loan ID (protected route, requires authentication)
agentRoute.route("/client/:id").get( getClientDetails);

// Get all collections made by this agent (protected route, requires authentication)
agentRoute.route("/collections").get( getMyCollections);

export default agentRoute;
