import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const authenticateAgent = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // changed from JWT_SECRET

    const agent = await Agent.findById(decoded._id).select("-password");
    if (!agent) {
      throw new ApiError(401, "No agent found with this token");
    }

    req.user = agent;
    next();
  } catch (err) {
    throw new ApiError(401, "Not authorized, invalid or expired token");
  }
});
