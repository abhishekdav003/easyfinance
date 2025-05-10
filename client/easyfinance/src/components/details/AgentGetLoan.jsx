import React, { useState, useEffect } from "react";
import { AgentGetloanDetails } from "../../services/agentAPI.js";

const AgentGetClientLoans = ({ clientId, onBack, onCollectEmi }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientLoans = async () => {
      try {
        setLoading(true);
        const response = await AgentGetloanDetails(clientId);
        const updatedLoans = (response.data || []).map((loan) => {
          const totalEmis = loan.totalEmis || loan.tenureMonths || loan.tenureDays || 0;
          const hasPaidAllEmis = loan.paidEmis >= totalEmis;
          const hasPaidFullAmount = loan.totalCollected >= loan.totalPayable;
          const isLoanCompleted = hasPaidAllEmis || hasPaidFullAmount;
          return { ...loan, status: isLoanCompleted ? "Completed" : loan.status };
        });
        setLoans(updatedLoans);
      } catch (err) {
        setError("Failed to fetch client loans: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) fetchClientLoans();
  }, [clientId]);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "₹0";
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Client Loans</h2>
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Back</button>
      </div>

      {loading ? (
        <p>Loading loans...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : loans.length === 0 ? (
        <p>No loans found for this client.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Loan Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Start Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan._id} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-gray-800">{formatCurrency(loan.loanAmount)}</td>
                  <td className="px-4 py-2 text-gray-800">
                    {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onCollectEmi && onCollectEmi(loan)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Collect EMI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentGetClientLoans;
