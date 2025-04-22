import mongoose from "mongoose";

// EMI Collection Schema
const emiSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amountCollected: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Defaulted"], default: "Paid" },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
});

// Loan Schema (Embedded in Client)
const loanSchema = new mongoose.Schema({
  uniqueLoanNumber: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  disbursedAmount: { type: Number }, // after interest deduction
  interestRate: { type: Number, required: true },
  tenureDays: { type: Number, required: true },
  tenureMonths: { type: Number},
  emiType: { type: String, enum: ["Daily", "Weekly", "Monthly", "Full Payment"], required: true },
  totalPayable: { type: Number, required: true },
  totalCollected: { type: Number, default: 0 },
  totalAmountLeft: { type: Number, required: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date },
  emiRecords: [emiSchema], // list of EMI collection records
  status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Main Client Schema
const clientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true, unique: true },
  clientAddress: { type: String },
  clientPhoto: { type: String },
  loans: [loanSchema], // array of loans
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
