import mongoose, { Schema } from "mongoose";

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  }, { timestamps: true });
  
  // Password hash and compare logic as in Agent/Client
  
  export const Admin = mongoose.model("Admin", adminSchema);
  