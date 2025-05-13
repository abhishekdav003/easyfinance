// components/PayDefaultEmiForm.jsx
import React, { useState } from "react";
import { payDefaultEmi } from "../../services/api";

const PayDefaultEmiForm = ({ emi, onClose, onSuccess }) => {
  const [amountCollected, setAmountCollected] = useState(emi.amountDue);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [receiverName, setReceiverName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        emiId: emi._id,
        amountCollected: Number(amountCollected),
        // collectedBy: ._id, // replace with real ID if needed
        paymentMode,
        recieverName: paymentMode !== "Cash" ? receiverName : "",
        location: {
          lat: 0,
          lng: 0,
          address: "Manually entered", // or use navigator.geolocation if needed
        },
      };

      const res = await payDefaultEmi(emi.clientId._id, emi.loanId, payload);
      if (res.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        setError("Payment failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h3 className="text-xl font-semibold mb-4">Pay Defaulted EMI</h3>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Amount</label>
          <input
            type="number"
            value={amountCollected}
            onChange={(e) => setAmountCollected(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Online">Online</option>
          </select>
        </div>

        {paymentMode !== "Cash" && (
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Receiver Name</label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Confirm Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayDefaultEmiForm;
