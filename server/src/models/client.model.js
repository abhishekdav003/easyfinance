import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const clientschema = new mongoose.Schema(
  {
    clientusername: {
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
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    Fullname: {
      type: String,
      required: true,
      trim: true,
    },
    phonenumber: {
      type: Number,
    },
    photo: {
      type: String, //cloudnary url
      required: true,
    },
    address: {
      type: String,
      required: true,
    },

    isdefaulter: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

clientschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password.hash = await bcrypt.hash(this.password, 10);
  next();
});

clientschema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password.hash);
};

clientschema.methods.generateAccessToken = async function () {
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
clientschema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    }, // payload
    process.env.REFRESH_TOKEN_SECRET, // REFRESH token secret
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } //expiry token object from process.env
  );
};
clientschema.plugin(mongooseAggregatePaginate);
export const Client = mongoose.model("Client", clientschema);
