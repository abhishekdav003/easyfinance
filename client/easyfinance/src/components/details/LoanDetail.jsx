import React, { useState, useEffect } from "react";
import {
  getLoanDetailsById,
  getEmiCollectionHistory,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import CollectEMI from "../details/CollectEmi";
import { motion } from "framer-motion";

const LoanDetailsShow = ({ loanId, onBack }) => {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'emiHistory'
  const [showCollectEmi, setShowCollectEmi] = useState(false);

  const [emiHistory, setEmiHistory] = useState([]);
  const [emiHistoryLoading, setEmiHistoryLoading] = useState(false);
  const [emiError, setEmiError] = useState(null);

  console.log("loan.clientId:", loan?.clientId, "loan._id:", loan?._id);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        setLoading(true);
        const response = await getLoanDetailsById(loanId);
        setLoan(response.data); // ✅ Correct because your API returns { data: {...loanDetails...} }
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
  }, [loanId, setLoan]);

  useEffect(() => {
    const fetchEmiHistory = async () => {
      if (activeTab === "emiHistory" && loan?.clientId && loan?._id) {
        try {
          setEmiHistoryLoading(true);
          const response = await getEmiCollectionHistory(
            loan.clientId,
            loan._id
          );
          console.log("Fetched EMI history:", response),
            setEmiHistory(response.data); // Your API wraps response in { data: [...] }
          setEmiError(null);
        } catch (err) {
          setEmiError(err.message || "Failed to fetch EMI history");
        } finally {
          setEmiHistoryLoading(false);
        }
      }
    };
    fetchEmiHistory();
  }, [activeTab, loan]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-blue-600 font-medium">
            Loading loan details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-red-100 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md m-6"
        role="alert"
      >
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <strong className="font-bold text-lg">Error! </strong>
        </div>
        <span className="block mt-2">{error}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
        >
          Go Back
        </motion.button>
      </motion.div>
    );
  }

  if (!loan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 bg-gray-50 rounded-lg shadow-inner"
      >
        <svg
          className="mx-auto h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-700 mt-4">
          Loan not found
        </h2>
        <p className="text-gray-500 mt-2">
          The requested loan details could not be located
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
        >
          Go Back
        </motion.button>
      </motion.div>
    );
  }

  // Calculate Total Payable Amount
  const totalAmount = loan.loanAmount + (loan.totalInterest || 0);
  // Calculate Remaining Amount
  const remainingAmount = totalAmount - (loan.totalCollected || 0);

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round(((loan.totalCollected || 0) / totalAmount) * 100)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white shadow-lg rounded-xl p-6 max-w-4xl mx-auto border border-gray-100"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-blue-600">Loan</span> Details
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <svg
              className="h-4 w-4 mr-1 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
              />
            </svg>
            <span>Loan ID: </span>
            <span className="font-mono ml-1 bg-gray-100 px-2 py-0.5 rounded text-sm">
              {loan._id}
            </span>
          </p>
        </motion.div>
        <motion.div
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-5 rounded-lg shadow transition-all duration-300 flex items-center"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Loans
          </motion.button>
        </motion.div>
      </div>

      {/* Loan status banner with progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className={`mb-8 px-6 py-4 rounded-lg shadow-md ${
          loan.totalAmountLeft <= 0
            ? "bg-blue-50 border-l-4 border-blue-500"
            : "bg-green-50 border-l-4 border-green-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className={`h-6 w-6 mr-3 ${
                loan.totalAmountLeft <= 0 ? "text-blue-500" : "text-green-500"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {loan.totalAmountLeft <= 0 ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <div>
              <span className="font-semibold text-lg">
                {loan.totalAmountLeft <= 0 ? "Loan Completed" : "Loan Active"}
              </span>
              <div className="text-sm mt-1">
                {loan.totalAmountLeft <= 0
                  ? "All payments have been made"
                  : "Payments in progress"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">
              <span className="text-gray-600">Total:</span>{" "}
              <span className="text-gray-800">
                ₹{totalAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>{" "}
              <span
                className={`font-medium ${
                  loan.totalAmountLeft <= 0 ? "text-blue-600" : "text-green-600"
                }`}
              >
                ₹{remainingAmount.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-600">Progress</span>
            <span className="font-medium text-gray-800">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-2.5 rounded-full ${
                loan.totalAmountLeft <= 0 ? "bg-blue-600" : "bg-green-600"
              }`}
            ></motion.div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-6">
          <motion.button
            whileHover={{ y: -2 }}
            className={`pb-3 px-1 transition-all duration-300 ${
              activeTab === "details"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("details")}
          >
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Loan Details
            </div>
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            className={`pb-3 px-1 transition-all duration-300 ${
              activeTab === "emiHistory"
                ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("emiHistory")}
          >
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              EMI Collection History
            </div>
          </motion.button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "details" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Loan Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Loan Type:</span>
                <span className="font-medium text-gray-800">
                  {loan.loanType || "Personal"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-medium text-gray-800">
                  {loan.interestRate}%
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-medium text-gray-800">
                  ₹{loan.loanAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">EMI Amount:</span>
                <span className="font-medium text-gray-800">
                  ₹{loan.emiAmount?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium text-gray-800">
                  ₹{loan.totalInterest?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600">Total Repayment:</span>
                <span className="font-medium text-gray-800">
                  {loan.totalRepayment != null
                    ? "₹" + loan.totalRepayment.toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Repayment Schedule
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Tenure:</span>
                <span className="font-medium text-gray-800">
                  {loan.tenureMonths
                    ? `${loan.tenureMonths} months`
                    : loan.tenureDays
                    ? `${loan.tenureDays} days`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium text-gray-800">
                  {new Date(loan.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium text-gray-800">
                  {loan.dueDate
                    ? new Date(loan.dueDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">EMIs Paid:</span>
                <div>
                  <span className="font-medium text-gray-800">
                    {loan.paidEmis || 0}/
                    {loan.totalEmis || loan.tenureMonths || loan.tenureDays}
                  </span>
                  {/* Mini progress bar */}
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 ml-2 mt-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${
                          ((loan.paidEmis || 0) /
                            (loan.totalEmis ||
                              loan.tenureMonths ||
                              loan.tenureDays)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-200">
                <span className="text-gray-600">Next EMI Date:</span>
                <span className="font-medium text-gray-800">
                  {loan.nextEmiDate
                    ? new Date(loan.nextEmiDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-gray-800">
                  ₹{loan.totalCollected?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Additional Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-100 md:col-span-2 hover:shadow-md transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">
                    Client:
                  </span>
                  <span className="text-gray-800 flex items-center">
                    <svg
                      className="h-4 w-4 mr-1 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {loan.clientName || "N/A"}
                  </span>
                </div>

                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">
                    Created By:
                  </span>
                  <span className="text-gray-800">
                    {loan.createdByName}
                    {loan.createdBy?.role && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">
                        {loan.createdBy?.role}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-32">
                    Created At:
                  </span>
                  <span className="text-gray-800">
                    {new Date(loan.createdAt).toLocaleString()}
                  </span>
                </div>

                {loan.notes && (
                  <div className="flex">
                    <span className="font-medium text-gray-600 w-32">
                      Notes:
                    </span>
                    <span className="text-gray-800">{loan.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            EMI Collection History
          </h2>

          {emiHistoryLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <p className="text-gray-600">Loading EMI history...</p>
            </div>
          ) : emiError ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex">
                <svg
                  className="h-6 w-6 text-red-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-600">{emiError}</p>
              </div>
            </div>
          ) : emiHistory.length === 0 ? (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 bg-gray-50 rounded-lg shadow-inner"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-gray-500 mt-4">
                No EMI collection history found for this loan
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="overflow-x-auto rounded-lg shadow border border-gray-200"
            >
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collected By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reciever Name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {emiHistory.map((emi, index) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      key={index}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-2 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(emi.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-2 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                          ₹{emi.amountCollected?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-2 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {emi.collectedBy || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs rounded-full inline-flex items-center ${
                            emi.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : emi.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {emi.status === "Paid" && (
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {emi.status === "Pending" && (
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                          {emi.status !== "Paid" &&
                            emi.status !== "Pending" && (
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            )}
                          {emi.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs rounded-full inline-flex items-center ${
                            emi.paymentMode === "Cash"
                              ? "bg-green-100 text-green-800"
                              : emi.paymentMode === "Online"
                              ? "bg-pink-300 text-black"
                              : "bg-blue-700 text-white"
                          }`}
                        >
                          {emi.paymentMode === "Cash" && (
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {emi.paymentMode === "Online" && (
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                          {emi.paymentMode === "Cheque" && (
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}

                          {emi.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {emi.paymentMode?.toLowerCase() !== "cash" &&
                        emi.recieverName
                          ? emi.recieverName
                          : "N/A"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Collect EMI Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-8 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center mx-auto"
          onClick={() => setShowCollectEmi(true)}
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Collect EMI
        </motion.button>
      </motion.div>

      {showCollectEmi && loan?.clientId && loan?._id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 border-t pt-6"
        >
          <CollectEMI
            clientId={loan.clientId}
            loanId={loan._id}
            onClose={() => setShowCollectEmi(false)}
            embedded={true}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoanDetailsShow;
