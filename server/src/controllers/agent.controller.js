import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import Client  from "../models/client.loan.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import twilio from "twilio";
import isSameDay from 'date-fns/isSameDay';
import { uploadOnCloudinary } from "../utils/cloudnary.js";

const generateAccessAndRefrshToken = async (agentId) => {
  try {
    const agent = await Agent.findById(agentId);
    const accessToken = agent.generateAccessToken();
    const refreshToken = agent.generateRefreshToken();
    agent.refreshtoken = refreshToken;
    await agent.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "SOMETHING went wrong while generating refresh and access token"
    );
  }
};
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

  const { accessToken, refreshToken } = await generateAccessAndRefrshToken(
    agent._id
  );
  const loggedinAgent = await Agent.findById(agent._id).select(
    "-password -refreshtoken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { agent: loggedinAgent, accessToken, refreshToken }, // here we are handeling the case where admin wants to set his cokkies him self in his local system may be he wants to login from another device
        "Agent logged in successfully"
      )
    );
});

/// === agent logout
export const agentLogout = asyncHandler(async (req, res) => {
  await Agent.findByIdAndUpdate(
    req.agent._id,
    {
      $set: {
        refreshToken: undefined, // removing refresh token from database
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "agent logged out successfully"));
});

//emi collection log 

const clientTwilio = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_FROM
const toAdminNumber = process.env.ADMIN_WHATSAPP_TO
export const collectEMI = asyncHandler(async (req, res) => {
  const { clientId, loanId } = req.params;
  const { amountCollected, status, location } = req.body;
  const agentId = req.agent._id;

  const client = await Client.findById(clientId);
  if (!client) throw new ApiError(404, "Client not found");

  const loan = client.loans.id(loanId);
  if (!loan) throw new ApiError(404, "Loan not found");

  // ✅ Check if EMI already collected today
  const today = new Date();
  const alreadyCollectedToday = loan.emiRecords.some(record =>
    isSameDay(new Date(record.date), today)
  );

  // if (alreadyCollectedToday) {
  //   throw new ApiError(400, "EMI already collected for today.");
  // }

  const emiEntry = {
    date: today,
    amountCollected,
    status,
    collectedBy: agentId,
    location,
  };

  loan.emiRecords.push(emiEntry);
  loan.totalCollected += amountCollected;
  loan.totalAmountLeft -= amountCollected;
  loan.updatedAt = new Date();

  // Calculate computed fields after EMI collection
loan.paidEmis = loan.emiRecords.filter(e => e.status === "Paid").length;

// Estimate total EMIs from tenure
const totalEmis = loan.tenureMonths ?? loan.tenureDays ?? 0;
loan.totalEmis = totalEmis;

// Calculate next EMI date
const nextDate = new Date();
if (loan.emiType === "Monthly") nextDate.setMonth(nextDate.getMonth() + 1);
else if (loan.emiType === "Weekly") nextDate.setDate(nextDate.getDate() + 7);
else if (loan.emiType === "Daily") nextDate.setDate(nextDate.getDate() + 1);
loan.nextEmiDate = nextDate;

// Compute interest and repayment
loan.totalInterest = loan.totalPayable - loan.loanAmount;
loan.totalRepayment = loan.totalPayable;
console.log("Updated loan data:", loan);
  await client.save();
  
  const updatedLoan = client.loans.id(loanId);

  const agent = await Agent.findById(agentId);
  console.log("EMI status received:", status);
  console.log("All EMIs:", loan.emiRecords.map(e => e.status));
  console.log("Paid EMIs:", loan.emiRecords.filter(e => e.status === "Paid").length);
  

  const messageBody = `📢 *EMI Collected!*\n👤 *Client:* ${client.clientName}\n💸 *Amount:* ₹${amountCollected}\n🕒 *Time:* ${today.toLocaleString()}\n📍 *Location:* ${location.address}\n🙋‍♂️ *Collected By:* ${agent.fullname}`;

  await clientTwilio.messages.create({
    from: fromWhatsAppNumber,
    to: toAdminNumber,
    body: messageBody,
  });

  res.status(200).json(new ApiResponse(200, updatedLoan, "EMI collected and recorded successfully"));
});

export const AgentaddClient = asyncHandler(async (req, res) => {
  const { clientName, clientPhone, clientAddress, clientPhoto, email } = req.body;
  let loans = [];
  if (req.body.loans) {
    try {
      loans = typeof req.body.loans === "string"
        ? JSON.parse(req.body.loans)
        : req.body.loans;
    } catch (error) {
      throw new ApiError(400, "Invalid format for loans");
    }
  }

  const existingClient = await Client.findOne({
    $or: [{ clientPhone }, { clientName }],
  });

  if (existingClient) {
    throw new ApiError(400, "Client already exists");
  }

  const clientpic = await uploadOnCloudinary(req.file?.path);
  console.log(req);
  
  const creatorId = req.admin?._id || req.agent?._id;
  console.log("🔁 creatorId:", creatorId);
  
  if (!creatorId) {
    throw new ApiError(401, "Missing creator information (admin or agent).");
  }

  const processedLoans = loans.map((loan) => {
    const {
      loanAmount,
      interestRate,
      tenureDays,
      tenureMonths,
      emiType,
      startDate = new Date()
    } = loan;

    const principal = Number(loanAmount);
    const rate = Number(interestRate);
    const totalTenureDays = Number(tenureDays || 0);
    const totalTenureMonths = Number(tenureMonths || 0);
    const tenureInYears = totalTenureMonths ? totalTenureMonths / 12 : totalTenureDays / 365;
   
    const interest = (loanAmount * interestRate * tenureInYears) / 100;
    const totalPayable = principal + interest;
    const disbursedAmount = principal - interest;
    const totalAmountLeft = totalPayable;

    const start = new Date(startDate);
    const dueDate = new Date(start.getTime() + totalTenureDays * 24 * 60 * 60 * 1000);
    if (isNaN(dueDate.getTime())) {
      throw new ApiError(400, "Invalid due date calculated from tenure");
    }

    // ✅ EMI calculation based on total repayment
    let emiAmount = 0;
    if (emiType === "Daily") {
      emiAmount = totalTenureDays ? totalPayable / totalTenureDays : totalPayable;
    } else if (emiType === "Weekly") {
      const weeks = Math.ceil(totalTenureDays / 7) || 1;
      emiAmount = totalPayable / weeks;
    } else if (emiType === "Monthly") {
      const months = totalTenureMonths || Math.floor(totalTenureDays / 30) || 1;
      emiAmount = totalPayable / months;
    } else if (emiType === "Full Payment") {
      emiAmount = totalPayable;
    }

    emiAmount = Math.round(emiAmount);

    return {
      uniqueLoanNumber: uuidv4(),
      loanAmount: principal,
      disbursedAmount,
      interestRate: rate,
      tenureDays: totalTenureDays,
      tenureMonths: totalTenureMonths,
      emiType,
      emiAmount,
      totalPayable,
      totalCollected: 0,
      totalAmountLeft,
      startDate: start,
      dueDate,
      emiRecords: [],
      status: "Ongoing",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: creatorId
    };
  });

  const newClient = await Client.create({
    clientName,
    clientPhone,
    clientAddress,
    clientPhoto: clientpic?.url || "",
    loans: processedLoans,
    email,
  });

  return res.status(201).json(
    new ApiResponse(201, { newClient }, "Client and loan(s) added successfully")
  );
});