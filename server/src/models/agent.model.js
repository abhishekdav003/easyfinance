import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --- Agent Schema ---
const agentSchema = new Schema(
  {
    agentusername: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String, // cloudinary or other hosting URL
    },
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

agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

agentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

agentSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
      clientusername: this.clientusername,
      Fullname: this.Fullname,
      phonenumber: this.phonenumber,
    }, // payload
    process.env.ACCESS_TOKEN_SECRET, // access token secret
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } //expiry token object from process.env
  );
};
agentSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    }, // payload
    process.env.REFRESH_TOKEN_SECRET, // REFRESH token secret
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } //expiry token object from process.env
  );
};
export const Agent = mongoose.model("Agent", agentSchema);
