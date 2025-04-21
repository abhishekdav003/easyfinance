import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Agent } from "../models/agent.model.js";

export const verifyAgentJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const agent = await Agent.findById(decodedToken?._id).select("-password -refreshToken");

    if (!agent) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.agent = agent;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid Access Token");
  }
});
