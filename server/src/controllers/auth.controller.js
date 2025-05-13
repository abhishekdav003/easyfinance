// controllers/auth.controller.js

import { Admin } from "../models/admin.model.js"; // Changed to named import
import { Agent } from "../models/agent.model.js"; // Assuming Agent is also a named export
import OTP from "../models/otp.model.js"; // We'll create this model next
import { sendEmail } from "../services/email.service.js"; // We'll create this next
import bcrypt from "bcrypt";
import crypto from "crypto";

// Request Password Reset - Generates and sends OTP
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists (either admin or agent)
    const admin = await Admin.findOne({ email });
    const agent = await Agent.findOne({ email });

    if (!admin && !agent) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({
        success: true,
        message: "If your email is registered, you will receive an OTP shortly",
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate OTP expiry (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP to database
    await OTP.findOneAndUpdate(
      { email },
      { email, otp, expiresAt, userType: admin ? "admin" : "agent" },
      { upsert: true, new: true }
    );

    // Send OTP via email
    const emailSubject = "Password Reset OTP";
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background: linear-gradient(to right, #5964e5, #9c4dcc); padding: 20px; border-radius: 5px 5px 0 0; text-align: center; color: white;">
          <h2>Password Reset Request</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the following One-Time Password (OTP) to complete the process:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Thank you,<br/>Your Support Team</p>
        </div>
      </div>
    `;

    await sendEmail(email, emailSubject, emailContent);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

// Verify OTP and generate reset token
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Update OTP record with reset token
    otpRecord.resetToken = tokenHash;
    otpRecord.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while verifying OTP",
    });
  }
};

// Reset password with valid token
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token and new password are required",
      });
    }

    // Hash the token from the request to compare with stored hash
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find the OTP record with matching token
    const otpRecord = await OTP.findOne({
      email,
      resetToken: tokenHash,
      resetTokenExpiresAt: { $gt: Date.now() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password based on user type
    if (otpRecord.userType === "admin") {
      await Admin.findOneAndUpdate({ email }, { password: hashedPassword });
    } else {
      await Agent.findOneAndUpdate({ email }, { password: hashedPassword });
    }

    // Remove OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
    });
  }
};
