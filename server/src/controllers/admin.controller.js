import bcrypt from "bcrypt";
import { Admin } from "../models/admin.model.js";
import { Agent } from "../models/agent.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";
// Register Admin
// ==========================
export const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, profileImage } = req.body;
  // if (username || email || password === "") {
  //   throw new apiError(400 , "All Fields are required")
  // }
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }
  // 2. Check if ANY admin already exists (only allow one admin)
  const totalAdmins = await Admin.countDocuments();
  if (totalAdmins > 0) {
    throw new ApiError(403, "Admin already exists. Only one admin is allowed.");
  }

  const profileImagelocalpath = req.files?.profileImage[0]?.path;
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

// ==========================
// Login Admin
// ==========================
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Check if all required fields are provided
  if ((!email && !username) || !password) {
    throw new ApiError(400, "Email/Username and Password are required");
  }

  // Find admin by email or username
  const admin = await Admin.findOne(email ? { email } : { username });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  // Create response object without password
  const { password: _, refreshToken, ...safeAdmin } = admin.toObject();
  //  password: _ burning password before sending it to frontend

  return res
    .status(200)
    .json(new ApiResponse(200, "Admin logged in successfully", safeAdmin));
});

// ==========================
// Add Agent
// ==========================

export const addAgent = asyncHandler(async (req, res) => {
  const { fullname, email, agentusername, password, fathername , photo } = req.body;
console.log("req.body",req.body);

  if (
    [fullname, email, agentusername, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }
  const agentExist = await Agent.findOne({ agentusername });
  if (agentExist) {
    throw new ApiError(400, "Agent already exists");
  }
   
// agent photo
const photolocalpath = req.files?.photo[0]?.path;
  const agentProfile = await uploadOnCloudinary(photolocalpath);



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
