import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const authenticateAgent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized: Token missing or malformed");
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token using ACCESS_TOKEN_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Retrieve the agent details from the database based on the decoded user ID
    const agent = await Agent.findById(decoded._id).select("-password");

    if (!agent) {
      throw new ApiError(401, "Unauthorized: Agent not found");
    }

    // Attach the agent object to the request so it's available in route handlers
    req.user = agent;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    throw new ApiError(
      401,
      `Unauthorized: Invalid or expired token - ${error.message}`
    );
  }
});
