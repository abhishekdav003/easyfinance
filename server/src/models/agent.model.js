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
    clientassigned: [
      {
        type: Schema.Types.ObjectId,
        ref: "Client",
      },
    ],

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


agentSchema.pre("save" , async function(next){
    if (!this.isModified("password"))return next();
    this.password.hash = await bycrypt.hash(this.password , 10)
    next()
})

agentSchema.methods.isPasswordCorrect = async function(password){
   return await bycrypt.compare(password , this.password.hash)
}
export const Agent = mongoose.model("Agent", agentSchema);
