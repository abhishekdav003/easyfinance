import mongoose, { Schema } from "mongoose";

const loanSchema = new Schema(
  {
    clientName: {
       type: String, required: true 
      },
    clientPhone: {
       type: String, required: true 

    },
    clientAddress: {
       type: String, required: true 

    },

    uniqueLoanNumber: {
       type: String, required: true, unique: true 

    },
    loanAmount: {
       type: Number, required: true 

    },
    interestRate: { 
      type: Number, required: true 

    }, // in %
    tenureMonths: {
       type: Number, required: true 

    },
    emiType: {
      type: String,
      enum: ["Monthly", "Weekly", "Full Payment"],
      required: true,
    },
    isFullPayment: {
       type: Boolean, default: false 
      
    },

    startDate: {
       type: Date, required: true 
      
    },
    dueDate: {
       type: Date 
      
    }, // optional
    paidAmount: {
       type: Number, default: 0 
      
    },
    totalPayable: {
       type: Number 
      
    }, // calculated based on interest
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Defaulted"],
      default: "Ongoing",
    },

    agentId: { type: Schema.Types.ObjectId, ref: "Agent" }, // who created it (can be assigned later)
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Loan", loanSchema);
