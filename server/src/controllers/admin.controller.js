import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { Agent } from "../models/agent.model.js";

// ==========================
// Register Admin
// ==========================
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Login Admin
// ==========================
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================
// Add Agent
// ==========================
export const addAgent = async (req, res) => {
  const { agentusername, email, password, fullname, fathername, photo } =
    req.body;

  try {
    // Check if agent username or email already exists
    const existingAgent = await Agent.findOne({
      $or: [{ agentusername }, { email }],
    });
    if (existingAgent) {
      return res
        .status(400)
        .json({ message: "Agent username or email already exists" });
    }

    // Create new agent with plain-text password.
    // The Agent model's pre('save') hook will hash it automatically.
    const newAgent = new Agent({
      agentusername,
      email,
      password,
      fullname,
      fathername,
      photo,
    });
    await newAgent.save();

    res.status(201).json({
      message: "Agent added successfully",
      agent: {
        id: newAgent._id,
        agentusername: newAgent.agentusername,
        email: newAgent.agentusername, // assuming email === agentusername
        fullname: newAgent.fullname,
        fathername: newAgent.fathername,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
