import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import Loan from "../models/loan.model.js";
import { Collection } from "../models/collection.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// ==========================
// Agent Login
// ==========================
export const agentLogin = asyncHandler(async (req, res) => {
  const { agentusername, email, password } = req.body;

  if ((!agentusername && !email) || !password) {
    return res
      .status(400).json(new ApiResponse(400, "Email/Username and Password are required"));
  }

  const agent = await Agent.findOne({ email });
  if (!agent) return res.status(404).json({ message: "Agent not found" });

  const isMatch = await bcrypt.compare(password, agent.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  const safedata = await Agent.findById(agent._id).select(
    "-password -refreshtoken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Agent logged in successfully", safedata));

});

// ==========================
// Add Loan
// ==========================
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
  if (existingLoan)
    return res.status(400).json({ message: "Loan number already exists" });

  const totalPayable =
    loanAmount + (loanAmount * interestRate * tenureMonths) / (100 * 12);

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
    agentId: req.agent._id,
  });

  const savedLoan = await newLoan.save();

  await Agent.findByIdAndUpdate(req.agent._id, {
    $push: { loanassigned: savedLoan._id },
  });

  res
    .status(201)
    .json({ message: "Loan created successfully", loan: savedLoan });
});

// ==========================
// Search Client by Loan Number
// ==========================
export const searchClientByLoanNumber = asyncHandler(async (req, res) => {
  const { loanNumber } = req.params;

  const loan = await Loan.findOne({ uniqueLoanNumber: loanNumber }).populate(
    "agentId",
    "fullname email"
  );

  if (!loan) return res.status(404).json({ message: "Loan not found" });

  res.status(200).json({ loan });
});

// ==========================
// Collect Payment
// ==========================
export const collectPayment = asyncHandler(async (req, res) => {
  const { loanId, amount, paymentMode, lat, lng } = req.body;

  const loan = await Loan.findById(loanId);
  if (!loan) return res.status(404).json({ message: "Loan not found" });

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

  res
    .status(200)
    .json({ message: "Collection recorded successfully", collection });
});

// ==========================
// Get All Clients
// ==========================
export const getAllClients = asyncHandler(async (req, res) => {
  const loans = await Loan.find().populate("agentId", "fullname");
  res.status(200).json({ loans });
});

// ==========================
// Get Client Details by Loan ID
// ==========================
export const getClientDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = await Loan.findById(id).populate("agentId", "fullname");
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  res.status(200).json({ loan });
});

// ==========================
// Get Agent's Collections
// ==========================
export const getMyCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({ agentId: req.user._id })
    .populate("loanId", "clientName uniqueLoanNumber")
    .sort({ createdAt: -1 });

  res.status(200).json({ collections });
});
