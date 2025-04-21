import { Admin } from "../models/admin.model.js";
import { Agent } from "../models/agent.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";


const generateAccessAndRefrshToken = async (adminId) => {
  try {
   const admin = await Admin.findById(adminId)
   const accessToken = admin.generateAccessToken()
   const refreshToken = admin.generateRefreshToken()

   admin.refreshToken = refreshToken
   await admin.save({validateBeforeSave: false})

   return {accessToken, refreshToken}
   
   

  } catch (error) {
    throw new ApiError(500, "SOMETHING went wrong while generating refresh and access token");
  }
}



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
  const profileImagelocalpath =  req.file?.path;
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
    $or:[{username} , {email}]
  });

  if (!admin) {
    throw new ApiError(404, "Admin does not exist");
  }
  const isMatch = await admin.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }
  
  const {accessToken, refreshToken} = await generateAccessAndRefrshToken(admin._id)
  
 const loggedinAdmin = await Admin.findById(admin._id).select("-password -refreshToken")
  
 // cookies only modifiable from server when  we do httpOnly: true, secure: true
 const options = {
    httpOnly: true,
    secure: true,     
  } 

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {admin: loggedinAdmin,
      accessToken,
      refreshToken}, // here we are handeling the case where admin wants to set his cokkies him self in his local system may be he wants to login from another device
      "Admin logged in successfully"
    ));
});

// logout admin 
 export const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $set:{
        refreshToken:undefined // removing refresh token from database
      }
    },
    {
      new: true
    }
  )   
  //clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, "Admin logged out successfully"))
})



// Add Agent
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
