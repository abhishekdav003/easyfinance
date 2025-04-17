import mongoose, { Schema } from "mongoose";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";

const agentSchema = new mongoose.Schema(
  {
    agentusername: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // remember to use indexing only on the feild tou want to perform search on dont use it everywhere it will degrade performance
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    Fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    photo: {
      type: String, //cloudnary url
      required: true,
    },
    loanassigned: [{ type: Schema.Types.ObjectId, ref: "Loan" }],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

agentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bycrypt.hash(this.password, 10);
  next();
});

agentSchema.methods.isPasswordCorrect = async function (password) {
  return await bycrypt.compare(password, this.password);
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
