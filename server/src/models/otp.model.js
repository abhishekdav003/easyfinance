// models/otp.model.js

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["admin", "agent"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  resetToken: String,
  resetTokenExpiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "10m", // The document will be automatically deleted after 10 minutes
  },
});

// Index for faster lookups
otpSchema.index({ email: 1, otp: 1 });
otpSchema.index({ email: 1, resetToken: 1 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
