import { useState, useEffect } from "react";
import { Save, X, Loader2, DollarSign, Percent, Calendar, Clock } from "lucide-react";
import { addLoanToClient } from "../../services/api";

const AddLoanForm = ({ clientId, onClose, onLoanAdded }) => {
  const [loan, setLoan] = useState({
    loanAmount: "",
    interestRate: "",
    tenureDays: "",
    tenureMonths: "",
    emiType: "Daily",
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [emiAmount, setEmiAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Calculate EMI live whenever inputs change
  useEffect(() => {
    if (!loan.loanAmount || !loan.emiType) {
      setEmiAmount(0);
      return;
    }
    const totalLoan = parseFloat(loan.loanAmount);
    let emi = 0;

    if (loan.emiType === "Daily" && loan.tenureDays) {
      emi = totalLoan / loan.tenureDays;
    } else if (loan.emiType === "Weekly" && loan.tenureDays) {
      const weeks = Math.ceil(loan.tenureDays / 7);
      emi = totalLoan / weeks;
    } else if (loan.emiType === "Monthly" && loan.tenureMonths) {
      emi = totalLoan / loan.tenureMonths;
    } else if (loan.emiType === "Full Payment") {
      emi = totalLoan;
    }

    setEmiAmount(Math.round(emi));
  }, [loan]);

  const handleChange = (field, value) => {
    setLoan((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "emiType" ? { tenureDays: "", tenureMonths: "" } : {}), // reset tenure when emiType changes
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError("");

    try {
      const preparedLoan = {
        loanAmount: loan.loanAmount,
        interestRate: loan.interestRate,
        emiType: loan.emiType,
        startDate: loan.startDate,
        emiAmount: emiAmount,
        totalPayable: loan.loanAmount,
        totalAmountLeft: loan.loanAmount,
      };

      if (loan.emiType === "Monthly") {
        preparedLoan.tenureMonths = loan.tenureMonths;
      } else if (loan.emiType !== "Full Payment") {
        preparedLoan.tenureDays = loan.tenureDays;
      }

      await addLoanToClient(clientId, [preparedLoan]);
      if (onLoanAdded) onLoanAdded();
      if (onClose) onClose();
    } catch (err) {
      console.error("Error adding loan:", err);
      setApiError(err.response?.data?.message || "Failed to add loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100 animate-fadeIn">
      <div className="flex items-center justify-between mb-4 sm:mb-6 border-b pb-3 sm:pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">Add New Loan</h2>
        <button 
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded-md animate-slideDown">
          <div className="flex">
            <div className="flex-shrink-0">
              <X size={18} className="text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="relative animate-slideUp" style={{ animationDelay: "0ms" }}>
          <DollarSign size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="number"
            placeholder="Loan Amount"
            value={loan.loanAmount}
            onChange={(e) => handleChange("loanAmount", e.target.value)}
            className="border border-gray-300 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="relative animate-slideUp" style={{ animationDelay: "100ms" }}>
          <Percent size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="number"
            placeholder="Interest Rate (%)"
            value={loan.interestRate}
            onChange={(e) => handleChange("interestRate", e.target.value)}
            className="border border-gray-300 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="relative animate-slideUp" style={{ animationDelay: "200ms" }}>
          <Clock size={18} className="absolute left-3 top-3 text-gray-400" />
          <select
            value={loan.emiType}
            onChange={(e) => handleChange("emiType", e.target.value)}
            className="border border-gray-300 p-2 pl-10 rounded-lg w-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Full Payment">Full Payment</option>
          </select>
        </div>

        {/* Render tenure input based on EMI type */}
        {loan.emiType !== "Full Payment" && (
          <div 
            className="relative animate-slideUp" 
            style={{ animationDelay: "300ms" }}
          >
            {loan.emiType === "Monthly" ? (
              <>
                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  placeholder="Tenure (Months)"
                  value={loan.tenureMonths}
                  onChange={(e) => handleChange("tenureMonths", e.target.value)}
                  className="border border-gray-300 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </>
            ) : (
              <>
                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  placeholder="Tenure (Days)"
                  value={loan.tenureDays}
                  onChange={(e) => handleChange("tenureDays", e.target.value)}
                  className="border border-gray-300 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </>
            )}
          </div>
        )}

        <div className="relative animate-slideUp" style={{ animationDelay: "400ms" }}>
          <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="date"
            value={loan.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="border border-gray-300 p-2 pl-10 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Show calculated EMI */}
        <div 
          className="col-span-1 md:col-span-2 mt-2 animate-slideUp" 
          style={{ animationDelay: "500ms" }}
        >
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-indigo-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-indigo-700 font-medium">Calculated EMI:</span>
              <span className="text-xl sm:text-2xl font-bold text-indigo-700">₹{emiAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 animate-slideUp"
        style={{ animationDelay: "600ms" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 w-full sm:w-auto mb-2 sm:mb-0"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddLoanForm;