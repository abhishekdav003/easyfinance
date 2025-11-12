// services/email.service.js

import nodemailer from "nodemailer";
import config from "../config/config.js"; // Create this file or use your existing config

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure, // true for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
  tls: {
    rejectUnauthorized: false, // <-- This allows self-signed certs; use only in development
  },
});

// Verify connection configuration on service start
transporter
  .verify()
  .then(() => console.log("Email service is ready"))
  .catch((err) => console.log("Error with email configuration:", err));

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise} - Nodemailer send mail promise
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"${config.email.senderName}" <${config.email.user}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

/**
 * Send OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - One-time password
 * @returns {Promise} - Email send promise
 */
export const sendOTPEmail = async (email, otp) => {
  const subject = "Password Reset OTP";
  const html = `
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

  return sendEmail(email, subject, html);
};
