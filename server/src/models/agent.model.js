import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"; // Corrected typo: "bycrypt" -> "bcrypt"
import jwt from "jsonwebtoken";

// Define the schema for the Agent
const agentSchema = new mongoose.Schema(
  {
    agentusername: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Remember to use indexing only on fields you want to search on
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true, // Indexing on full name for search performance
    },
    email:{
      type: String,
      required: true,
    },
    fathername: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String, // This is a Cloudinary URL or similar for the agent's photo
      
    },
    loanassigned: [{ type: Schema.Types.ObjectId, ref: "Loan" }],
    password: {
      type: String,
      required: true,
    },
    refreshtoken: {
      type: String,
    },

    // Assigned loan references (admin assigned)
    loanassigned: [{ type: Schema.Types.ObjectId, ref: "Loan" }],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for password hashing (only when password is modified)
agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10); // Hash the password before saving
  next();
});

// Instance method to check if the password is correct
agentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare given password with hashed password
};

// Instance method to generate an access token
agentSchema.methods.generateAccessToken =  function () {
  return  jwt.sign(
    {
      _id: this._id,
      agentusername: this.agentusername, // Using agentusername as the identifier
      fullname: this.fullname, // Adjusted to use the fullname
    },
    process.env.ACCESS_TOKEN_SECRET, // Access token secret from environment variables
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // Access token expiry from environment variables
  );
};

// Instance method to generate a refresh token
agentSchema.methods.generateRefreshToken =  function () {
  return  jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Refresh token secret from environment variables
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Refresh token expiry from environment variables
  );
};

// Create and export the Agent model
export const Agent = mongoose.model("Agent", agentSchema);
