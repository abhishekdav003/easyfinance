import React, { useState, useEffect } from "react";
import { loanDetails } from "../../services/api.js";
import LoanDetailsShow from "../details/LoanDetail.jsx";
import { getLoanDetailsById } from "../../services/api.js";

const ClientLoans = ({ clientId, onBack, onViewLoanDetails }) => {
  const [loans, setLoans] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {

    const fetchClientLoans = async () => {
      try {
        setLoading(true);
        const response = await loanDetails(clientId);
        console.log("API Response for client loans:", response);

        setLoans(response.data || []);
        setClient(null); // No client data coming from backend currently
      } catch (err) {
        setError("Failed to fetch client loans: " + err.message);
        console.error("Error fetching client loans:", err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientLoans();
    }
  }, [clientId]);

  const handleViewLoanDetails = (loanId) => {
    if (onViewLoanDetails) {
          onViewLoanDetails(loanId);
        }
  };

  

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return "₹0";
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-6" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={onBack}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {client ? `${client.name}'s Loans` : "Client Loans"}
          </h1>
          {client && (
            <p className="text-gray-600 mt-1">Phone: {client.phone}</p>
          )}
        </div>
        <button 
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
        >
          Back to Client
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">No loans found for this client</h2>
          <p className="text-gray-500 mt-2">This client doesn't have any active loans</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <div 
              key={loan._id} 
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewLoanDetails(loan._id)}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {formatCurrency(loan.loanAmount)}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    loan.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    loan.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {loan.status || "Pending"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Type:</span>
                    <span className="font-medium text-gray-800">{loan.loanType || "Personal"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-medium text-gray-800">{loan.interestRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EMI Amount:</span>
                    <span className="font-medium text-gray-800">{formatCurrency(loan.emiAmount)}</span>
                  </div>
                  <div className="flex justify-between">
  <span className="text-gray-600">Tenure:</span>
  <span className="font-medium text-gray-800">
    {loan.tenureMonths ? `${loan.tenureMonths} months` : loan.tenureDays ? `${loan.tenureDays} days` : "N/A"}
  </span>
</div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium text-gray-800">
                      {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-500">Next EMI</span>
                      <p className="font-medium text-gray-800">
                        {loan.nextEmiDate ? new Date(loan.nextEmiDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">EMIs Paid</span>
                      <p className="font-medium text-gray-800">
                        {(loan.paidEmis || 0)}/{loan.totalEmis || loan.loanTerm || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientLoans;
