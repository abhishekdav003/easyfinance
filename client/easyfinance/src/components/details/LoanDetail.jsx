import React, { useState, useEffect } from "react";
import { getLoanDetailsById } from "../../services/api";
import { useNavigate } from 'react-router-dom';
const LoanDetailsShow = ({ loanId, onBack }) => {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'emiHistory'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const response = await getLoanDetailsById(loanId);
        setLoan(response.data);  // ✅ Correct because your API returns { data: {...loanDetails...} }
      } catch (err) {
        setError("Failed to fetch loan details: " + err.message);
        console.error("Error fetching loan details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId , setLoan ,]);
  console.log("Rendering LoanDetailsShow with loanId:", loanId);
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
  
  if (!loan) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700">Loan not found</h2>
        <button 
          onClick={onBack}
          className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }
  

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Loan Details
          </h1>
          <p className="text-gray-600 mt-1">
            Loan ID: {loan._id}
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onBack}
            className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
          >
            Back to Loans
          </button>
        </div>
      </div>

      {/* Loan status banner */}
      <div className={`mb-6 px-4 py-3 rounded-md ${
        loan.status === 'Active' || loan.status === 'Ongoing' ? 'bg-green-100' : 
        loan.status === 'Completed' ? 'bg-blue-100' : 'bg-yellow-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Status:</span> {loan.status || "Pending"}
          </div>
          <div>
            <span className="font-medium">Amount:</span> ₹{loan.loanAmount?.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-6">
          <button
            className={`pb-3 px-1 ${activeTab === 'details' ? 
              'border-b-2 border-blue-500 text-blue-600 font-medium' : 
              'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('details')}
          >
            Loan Details
          </button>
          <button
            className={`pb-3 px-1 ${activeTab === 'emiHistory' ? 
              'border-b-2 border-blue-500 text-blue-600 font-medium' : 
              'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('emiHistory')}
          >
            EMI Collection History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Loan Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Type:</span>
                <span className="font-medium text-gray-800">{loan.loanType || "Personal"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium text-gray-800">{loan.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium text-gray-800">₹{loan.loanAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMI Amount:</span>
                <span className="font-medium text-gray-800">₹{loan.emiAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium text-gray-800">₹{loan.totalInterest?.toLocaleString() || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Repayment:</span>
                <span className="font-medium text-gray-800">{loan.totalRepayment != null ? loan.totalRepayment.toLocaleString() : "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Repayment Schedule</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tenure:</span>
                <span className="font-medium text-gray-800">{loan.tenureMonths ? `${loan.tenureMonths} months` : loan.tenureDays ? `${loan.tenureDays} days` : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium text-gray-800">{new Date(loan.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium text-gray-800">
                {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EMIs Paid:</span>
                <span className="font-medium text-gray-800">{loan.paidEmis || 0}/{loan.totalEmis || (loan.tenureMonths || loan.tenureDays)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next EMI Date:</span>
                <span className="font-medium text-gray-800">
                  {loan.nextEmiDate ? new Date(loan.nextEmiDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-gray-800">₹{loan.totalCollected?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
          
          
          {/* Additional Details */}
          <div className="bg-gray-50 p-4 rounded-md md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Additional Information</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Client:</span>
                <span className="text-gray-800">{loan.clientName || "N/A"}</span>
              </div>
          
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Created By:</span>
                <span className="text-gray-800">{loan.createdByName} ({loan.createdBy?.role})</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Created At:</span>
                <span className="text-gray-800">{new Date(loan.createdAt).toLocaleString()}</span>
              </div>
              {loan.notes && (
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">Notes:</span>
                  <span className="text-gray-800">{loan.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">EMI Collection History</h2>
          
          {(!loan.emiHistory || loan.emiHistory.length === 0) ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No EMI collection history found for this loan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loan.emiHistory && loan.emiHistory.map((emi, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(emi.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{emi.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emi.collectedBy || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emi.paymentMode || "Cash"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          emi.status === 'Success' ? 'bg-green-100 text-green-800' : 
                          emi.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {emi.status || "Success"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Collect EMI Button */}
      <div className="mt-8 text-center">
      <button
  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
  onClick={() => navigate(`/collectemi/${loan.clientId}/${loan._id}`)}
>
  Collect EMI
</button>
      </div>
    </div>
  );
};

export default LoanDetailsShow;