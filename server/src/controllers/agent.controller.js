import jwt from "jsonwebtoken";
import { Agent } from "../models/agent.model.js";
import Client  from "../models/client.loan.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import twilio from "twilio";
import isSameDay from 'date-fns/isSameDay';

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

//emi coleection

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

