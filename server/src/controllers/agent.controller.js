import { Agent } from "../models/agent.model.js";
import Loan from "../models/loan.model.js";
import { Collection } from "../models/collection.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

// 🔐 Agent Login
export const agentLogin = asyncHandler(async (req, res) => {
  const { agentusername, password } = req.body;

  if (!agentusername || !password) {
    throw new ApiError(400, "Agent username and password are required");
  }

  const agent = await Agent.findOne({ agentusername });
  if (!agent) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await agent.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = agent.generateAccessToken();
  const refreshToken = agent.generateRefreshToken();

  agent.refreshtoken = refreshToken;
  await agent.save();

  res.status(200).json(
    new apiResponse(200, {
      accessToken,
      refreshToken,
      agent: {
        _id: agent._id,
        fullname: agent.fullname,
        email: agent.email,
        agentusername: agent.agentusername,
      },
    }, "Login successful")
  );
});

// ➕ Agent adds a new loan
export const agentAddLoan = asyncHandler(async (req, res) => {
  const {
    clientName,
    clientPhone,
    clientAddress,
    uniqueLoanNumber,
    loanAmount,
    interestRate,
    tenureMonths,
    emiType,
    isFullPayment,
    startDate,
  } = req.body;

  const existingLoan = await Loan.findOne({ uniqueLoanNumber });
  if (existingLoan) {
    throw new ApiError(400, "Loan number already exists");
  }

  const totalPayable = loanAmount + (loanAmount * interestRate * tenureMonths) / (100 * 12);

  const newLoan = new Loan({
    clientName,
    clientPhone,
    clientAddress,
    uniqueLoanNumber,
    loanAmount,
    interestRate,
    tenureMonths,
    emiType,
    isFullPayment,
    startDate,
    totalPayable,
    agentId: req.user._id,
  });

  const savedLoan = await newLoan.save();

  await Agent.findByIdAndUpdate(req.user._id, {
    $push: { loanassigned: savedLoan._id },
  });

  res.status(201).json(new apiResponse(201, savedLoan, "Loan created successfully"));
});

// 🔍 Search a customer by their unique loan number
export const searchClientByLoanNumber = asyncHandler(async (req, res) => {
  const { loanNumber } = req.params;
  const loan = await Loan.findOne({ uniqueLoanNumber: loanNumber }).populate("agentId", "Fullname email");

  if (!loan) {
    throw new ApiError(404, "Loan not found");
  }

  res.status(200).json(new apiResponse(200, loan));
});

// 💰 Record a collection with location
export const collectPayment = asyncHandler(async (req, res) => {
  const { loanId, amount, paymentMode, lat, lng } = req.body;

  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new ApiError(404, "Loan not found");
  }

  const collection = new Collection({
    loanId,
    agentId: req.user._id,
    amount,
    paymentMode,
    location: { lat, lng },
  });

  await collection.save();

  loan.paidAmount += amount;
  if (loan.paidAmount >= loan.totalPayable) {
    loan.status = "Completed";
  }

  await loan.save();

  res.status(200).json(new apiResponse(200, collection, "Collection recorded successfully"));
});

// 📋 Get all clients in the system
export const getAllClients = asyncHandler(async (req, res) => {
  const loans = await Loan.find().populate("agentId", "Fullname");
  res.status(200).json(new apiResponse(200, loans));
});

// 📄 Get single client details by loan ID
export const getClientDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const loan = await Loan.findById(id).populate("agentId", "Fullname");

  if (!loan) {
    throw new ApiError(404, "Loan not found");
  }

  res.status(200).json(new apiResponse(200, loan));
});

// 📈 Get all collections made by this agent
export const getMyCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({ agentId: req.user._id })
    .populate("loanId", "clientName uniqueLoanNumber")
    .sort({ createdAt: -1 });

  res.status(200).json(new apiResponse(200, collections));
});
