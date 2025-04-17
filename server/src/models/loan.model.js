import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number, // e.g., 10 for 10%
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
}, { timestamps: true });

export const Loan = mongoose.model("Loan", loanSchema);
