import mongoose, { Schema } from "mongoose";


const collectionSchema = new mongoose.Schema({
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["full", "emi"],
      required: true
    },
    location: {
      lat: Number,
      lng: Number
    },
    collectedAt: {
      type: Date,
      default: Date.now
    }
  }, { timestamps: true });
  
  export const Collection = mongoose.model("Collection", collectionSchema);
  