import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import Loan from "../models/loan.model.js";
import { Collection } from "../models/collection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";



const generateAccessAndRefrshToken = async(agentId) => {
  try {
    const agent = await Agent.findById(agentId)
    const accessToken = agent.generateAccessToken()
    const refreshToken = agent.generateRefreshToken()
    agent.refreshtoken = refreshToken
    await agent.save({validateBeforeSave: false})
  
    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "SOMETHING went wrong while generating refresh and access token");
  }
}
// ==========================
// Agent Login
// ==========================
export const agentLogin = asyncHandler(async (req, res) => {
  const { agentusername, email, password } = req.body;

  const agent = await Agent.findOne({
    $or: [{ agentusername }, { email }],
  });

  if ((!email && !agentusername) || !password) {
    throw new ApiError(400, "Email/Username and Password are required");
  }
  if (!agent) {
    throw new ApiError(401, "Agent not found");
  }

  const isPasswordCorrect = await agent.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }


  const {accessToken, refreshToken} = await generateAccessAndRefrshToken(agent._id)
  const loggedinAgent = await Agent.findById(agent._id).select("-password -refreshToken")
  const options = {
    httpOnly: true,
    secure: true,     
  } 
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(
    200,
    {agent: loggedinAgent,
    accessToken,
    refreshToken}, // here we are handeling the case where admin wants to set his cokkies him self in his local system may be he wants to login from another device
    "Agent logged in successfully"
  ))

});
