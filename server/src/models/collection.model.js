import mongoose, { Schema } from "mongoose";

const collectionSchema = new Schema(
  {
    loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    amount: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer"],
      required: true,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    collectedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Collection = mongoose.model("Collection", collectionSchema);
