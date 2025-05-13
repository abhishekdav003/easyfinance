import mongoose from "mongoose";

// EMI Collection Schema
const emiSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amountCollected: { type: Number, required: true },
  status: { type: String, enum: ["Paid", "Defaulted" , "Partial"], default: "Paid" },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
  paymentMode: { type: String, enum: ["Cash", "Cheque", "Online"], required: true },
  recieverName: { type: String },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
});


const defaultedEmiSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan" },
});

const DefaultedEMI = mongoose.model("DefaultedEMI", defaultedEmiSchema);
export { DefaultedEMI };


// Loan Schema (Embedded in Client)
const loanSchema = new mongoose.Schema({
  uniqueLoanNumber: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  disbursedAmount: { type: Number },
  interestRate: { type: Number, required: true },
  tenureDays: { type: Number },
  tenureMonths: { type: Number },
  emiType: { type: String, enum: ["Daily", "Weekly", "Monthly", "Full Payment"], required: true },
  emiAmount: { type: Number, required: true },  // 🔥 Add this line
  totalPayable: { type: Number, required: true },
  totalCollected: { type: Number, default: 0 },
  totalAmountLeft: { type: Number, required: true },
  startDate: { type: Date, required: true },
  dueDate: { type: Date },
  emiRecords: [emiSchema],
  paidEmis: { type: Number, default: 0 },
  status: { type: String, enum: ["Ongoing", "Completed"], default: "Ongoing" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
  
  
});

// Main Client Schema
const clientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  clientPhoneNumbers: [{ type: String, required: true, unique: true }],
  referalName: { type: String },
  referalNumber: { type: String },
  temporaryAddress: { type: String },
  permanentAddress: { type: String },
  shopAddress: { type: String },
  houseAddress: { type: String },
  clientPhoto: { type: String },
  housePhoto: { type: String },
  shopPhoto: { type: String },
  documents:[{type: String}],
  email: { type: String },
  loans: [loanSchema], // array of loans
  createdAt: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
});

const Client = mongoose.model("Client", clientSchema);

export default Client;


const Loan = mongoose.model("Loan", loanSchema);
export { Loan };

const EMI = mongoose.model("EMI", emiSchema);
export { EMI };



