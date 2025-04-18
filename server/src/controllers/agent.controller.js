import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import Loan from "../models/loan.model.js";
import { Collection } from "../models/collection.model.js";

// ==========================
// Agent Login
// ==========================
export const agentLogin = async (req, res) => {
  const { agentusername, password } = req.body;
  console.log("agent login dsta:", req.body);
  try {
    if (!agentusername || !password) {
      return res
        .status(400)
        .json({ message: "Login ID and password are required" });
    }

    // Assuming the email is stored as the agent's username
    // const query = { agentusername };
    const agent = await Agent.findOne( {agentusername} );
console.log('response', agent);

    if (!agent) return res.status(404).json({ message: "Agent not found" });

    // Compare the password with the stored hashed password
    // const isMatch = await bcrypt.compare(password, agent.password);
    // if (!isMatch)
    //   return res.status(401).json({ message: "Invalid credentials" });

    // Generate access token
    const accessToken = jwt.sign(
      { id: agent._id, role: "agent" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: agent._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    // Save the refresh token to the agent document
    agent.refreshtoken = refreshToken;
    await agent.save();

    // Send the login success response
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      agent: {
        id: agent._id,
        fullname: agent.fullname,
        email: agent.agentusername, // Return agentusername as email
        agentusername: agent.agentusername,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Add Loan
// ==========================
export const agentAddLoan = async (req, res) => {
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

  try {
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
      agentId: req.user._id,
    });

    const savedLoan = await newLoan.save();

    await Agent.findByIdAndUpdate(req.user._id, {
      $push: { loanassigned: savedLoan._id },
    });

    res
      .status(201)
      .json({ message: "Loan created successfully", loan: savedLoan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Search Client by Loan Number
// ==========================
export const searchClientByLoanNumber = async (req, res) => {
  const { loanNumber } = req.params;

  try {
    const loan = await Loan.findOne({ uniqueLoanNumber: loanNumber }).populate(
      "agentId",
      "fullname email"
    );

    if (!loan) return res.status(404).json({ message: "Loan not found" });

    res.status(200).json({ loan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Collect Payment
// ==========================
export const collectPayment = async (req, res) => {
  const { loanId, amount, paymentMode, lat, lng } = req.body;

  try {
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
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Get All Clients
// ==========================
export const getAllClients = async (req, res) => {
  try {
    const loans = await Loan.find().populate("agentId", "fullname");
    res.status(200).json({ loans });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Get Client Details by Loan ID
// ==========================
export const getClientDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const loan = await Loan.findById(id).populate("agentId", "fullname");

    if (!loan) return res.status(404).json({ message: "Loan not found" });

    res.status(200).json({ loan });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Get Agent's Collections
// ==========================
export const getMyCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ agentId: req.user._id })
      .populate("loanId", "clientName uniqueLoanNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({ collections });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
