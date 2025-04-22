import mongoose, { Schema } from "mongoose";

const loanSchema = new Schema(
   {
     clientName: { type: String, required: true },
     clientPhone: { type: String, required: true },
     clientAddress: { type: String, required: true },
     uniqueLoanNumber: { type: String, required: true, unique: true },
     clientPhoto: { type: String, required: true },
     loanAmount: { type: Number, required: true },
     interestRate: { type: Number, required: true }, // % like 5
     tenureMonths: {
      type: Number,
      default: 0,
    },
    tenureDays: {
      type: Number,
      default: 0,
    },
     emiType: {
       type: String,
       enum: ["Monthly", "Daily" , "Weekly", "Full Payment"],
       required: true,
     },
     isFullPayment: {
       type: Boolean,
       default: false,
     },
     startDate: {
       type: Date,
       required: true,
     },
     dueDate: Date,
     paidAmount: {
       type: Number,
       default: 0,
     },
     totalPayable: Number,
     status: {
       type: String,
       enum: ["Ongoing", "Completed", "Defaulted"],
       default: "Ongoing",
     },
     agentId: { type: Schema.Types.ObjectId, ref: "Agent" },
     adminId : { type:Schema.Types.ObjectId , ref :"Admin"}
   },
   {
     timestamps: true,
   }
 );
 
export default mongoose.model("Loan", loanSchema);
