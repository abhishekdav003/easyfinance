import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
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
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Add New Loan</h2>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
          {apiError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          type="number"
          placeholder="Loan Amount"
          value={loan.loanAmount}
          onChange={(e) => handleChange("loanAmount", e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="number"
          placeholder="Interest Rate (%)"
          value={loan.interestRate}
          onChange={(e) => handleChange("interestRate", e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        <select
          value={loan.emiType}
          onChange={(e) => handleChange("emiType", e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Full Payment">Full Payment</option>
        </select>

        {/* Render tenure input based on EMI type */}
        {loan.emiType !== "Full Payment" && (
          loan.emiType === "Monthly" ? (
            <input
              type="number"
              placeholder="Tenure (Months)"
              value={loan.tenureMonths}
              onChange={(e) => handleChange("tenureMonths", e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          ) : (
            <input
              type="number"
              placeholder="Tenure (Days)"
              value={loan.tenureDays}
              onChange={(e) => handleChange("tenureDays", e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          )
        )}

        <input
          type="date"
          value={loan.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* Show calculated EMI */}
        <div className="col-span-2 mt-2">
          <div className="bg-gray-100 p-3 rounded text-gray-800">
            <strong>Calculated EMI:</strong> ₹{emiAmount}
          </div>
        </div>

        <div className="col-span-2 flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-400 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
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
      </form>
    </div>
  );
};

export default AddLoanForm;
