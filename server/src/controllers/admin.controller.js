import { Admin } from "../models/admin.model.js";
import { Agent } from "../models/agent.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Client from "../models/client.loan.model.js";
import { v4 as uuidv4 } from 'uuid';

const generateAccessAndRefrshToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "SOMETHING went wrong while generating refresh and access token"
    );
  }
};

// Register Admin
export const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, profileImage } = req.body;
  // if (username || email || password === "") {
  //   throw new apiError(400 , "All Fields are required")
  // }
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }
  const totalAdmins = await Admin.countDocuments();
  if (totalAdmins > 0) {
    throw new ApiError(403, "Admin already exists. Only one admin is allowed.");
  }
  const profileImagelocalpath = req.file?.path;
  const profile = await uploadOnCloudinary(profileImagelocalpath);

  const admin = await Admin.create({
    username: username.toLowerCase(),
    email,
    password,
    profileImage: profile?.url || "",
  });
  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );
  if (!createdAdmin) {
    throw new ApiError(500, "SOMETHING went wrong while registering user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "Admin created successfully", createdAdmin));
});

// Login Admin
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    throw new ApiError(400, "Email/Username and Password are required");
  }
  const admin = await Admin.findOne({
    $or: [{ username }, { email }],
  });

  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }
  const isMatch = await admin.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefrshToken(
    admin._id
  );

  const loggedinAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken"
  );

  // cookies only modifiable from server when  we do httpOnly: true, secure: true
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
        { admin: loggedinAdmin, accessToken, refreshToken }, // here we are handeling the case where admin wants to set his cokkies him self in his local system may be he wants to login from another device
        "Admin logged in successfully"
      )
    );
});

// logout admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $set: {
        refreshToken: undefined, // removing refresh token from database
      },
    },
    {
      new: true,
    }
  );
  //clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Admin logged out successfully"));
});

// Add Agent
export const addAgent = asyncHandler(async (req, res) => {
  const { fullname, email, agentusername, password, fathername, photo } =
    req.body;
  if (
    [fullname, email, agentusername, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  // check if agent already exists
  const agentExist = await Agent.findOne({ agentusername });
  if (agentExist) {
    throw new ApiError(400, "Agent already exists");
  }

  // agent photo
  const agentProfile = await uploadOnCloudinary(req.file?.path);

  const newAgent = await Agent.create({
    fullname,
    email,
    agentusername,
    password,
    fathername,
    photo: agentProfile?.url || "",
  });

  const createdAgent = await Agent.findById(newAgent._id).select(
    "-password -refreshToken"
  );
  if (!createdAgent) {
    throw new ApiError(500, "SOMETHING went wrong while registering user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "Agent created successfully", createdAgent));
});

//remove agent
export const removeAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;

  const agent = await Agent.findById(agentId);
  if (!agent) {
    throw new ApiError(404, "Agent not found");
  }
  agent.refreshtoken = undefined;
  await agent.save({ validateBeforeSave: false });
  const deletedAgent = await Agent.findByIdAndDelete(agentId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Agent removed successfully"));
});

//show all agent list
export const agentList = asyncHandler(async (req, res) => {
  const agents = await Agent.find();
  return res.status(200).json(new ApiResponse(200, agents, "Agent list"));
});

// add a client
export const addClient = asyncHandler(async (req, res) => {
  const { clientName, clientPhone, clientAddress } = req.body;

  // Parse loans from string (FormData sends it as a string)
  let loans = [];
  if (req.body.loans) {
    try {
      loans = typeof req.body.loans === 'string' ? JSON.parse(req.body.loans) : req.body.loans;
    } catch (error) {
      throw new ApiError(400, "Invalid format for loans");
    }
  }

  // 🔍 Check if client already exists
  const client = await Client.findOne({
    $or: [{ clientPhone }, { clientName }],
  });

  if (client) {
    throw new ApiError(400, "Client already exists");
  }

  // 📸 Upload photo to Cloudinary
  const clientpic = await uploadOnCloudinary(req.file?.path);

  // 🧠 Process each loan
  const processedLoans = loans.map((loan) => {
    const {
      loanAmount,
      interestRate,
      tenureDays,
      tenureMonths,
      emiType,
      startDate = new Date()
    } = loan;

    // 🔁 Convert months to days if emiType is Monthly
    let totalTenureDays = tenureDays;
    if (!totalTenureDays && emiType === "Monthly" && tenureMonths) {
      totalTenureDays = tenureMonths * 30;
    }

    // ✅ Ensure required fields are present
    if (
      !loanAmount ||
      !interestRate ||
      !totalTenureDays ||
      !emiType
    ) {
      throw new ApiError(400, "Missing required loan fields");
    }

    const interest = (loanAmount * interestRate) / 100;
    const disbursedAmount = loanAmount - interest;
    const totalPayable = loanAmount;
    const totalAmountLeft = totalPayable;
    const start = new Date(startDate);
    const dueDate = new Date(start.getTime() + Number(totalTenureDays) * 24 * 60 * 60 * 1000);

    if (isNaN(dueDate.getTime())) {
      throw new ApiError(400, "Invalid due date calculated from tenure");
    }

    return {
      uniqueLoanNumber: uuidv4(),
      loanAmount,
      disbursedAmount,
      interestRate,
      tenureDays: totalTenureDays,
      emiType,
      totalPayable,
      totalCollected: 0,
      totalAmountLeft,
      startDate: start,
      dueDate,
      emiRecords: [],
      status: "Ongoing",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  // 🧾 Create client document
  const newClient = await Client.create({
    clientName,
    clientPhone,
    clientAddress,
    clientpic,
    loans: processedLoans
  });

  return res
  .status(201).json(
   new ApiResponse (201 , { newClient }, "Client and loan(s) added successfully" )
  );
});


//remove a client
export const removeClient = asyncHandler(async (req, res) => {
  const { clientId } = req.params;

  const client = await Client.findById(clientId);
  if (!client) {
    throw new ApiError(404, "Client not found");
  }
  
  await Client.findByIdAndDelete(clientId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Client removed successfully"));
})


// show all clients
export const clientList = asyncHandler(async (req, res) => {
  const clients = await Client.find().select("-Loans");
  return res.status(200).json(new ApiResponse(200, clients, "client list"));
});

//show client details
export const clientDetails = asyncHandler(async (req, res) => {
 const {clientId} = req.params
 const client = await Client.findById(clientId).populate("loans");
 return res.status(200).json(new ApiResponse(200, client, "client details fetched successfully"));

});
