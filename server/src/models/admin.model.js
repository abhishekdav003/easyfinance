import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"; // Corrected typo: "bycrypt" -> "bcrypt"
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String,  },
    refreshToken:{
      type: String
    }
  }, { timestamps: true });
  
  // Password hash and compare logic as in Agent/Client
  adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10); // Hash the password before saving
    next();
  });
  
  // Instance method to check if the password is correct
  adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // Compare given password with hashed password
  };
  

  adminSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
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
  adminSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET, // Refresh token secret from environment variables
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // Refresh token expiry from environment variables
    );
  };
  export const Admin = mongoose.model("Admin", adminSchema);
  