import React, { useState, useEffect } from "react";
import { loanDetails } from "../../services/api.js";
import LoanDetailsShow from "../details/LoanDetail.jsx";
import { getLoanDetailsById } from "../../services/api.js";
import { motion } from "framer-motion";

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
        
        const updatedLoans = (response.data || []).map((loan) => {
          const totalEmis = loan.totalEmis || loan.tenureMonths || loan.tenureDays || 0;
          const hasPaidAllEmis = loan.paidEmis >= totalEmis;
          const hasPaidFullAmount = loan.totalCollected >= loan.totalPayable;
        
          const isLoanCompleted = hasPaidAllEmis || hasPaidFullAmount;
        
          return {
            ...loan,
            status: isLoanCompleted ? "Completed" : loan.status,
          };
        });
        setLoans(updatedLoans);
        
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 12
      } 
    }
  };

  const statusVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.3,
        delay: 0.2
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
          }}
          className="h-16 w-16 border-4 border-t-blue-500 border-blue-200 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded shadow-md m-6" 
        role="alert"
      >
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <strong className="font-bold text-lg">Error! </strong>
        </div>
        <p className="mt-2">{error}</p>
        <motion.button 
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
        >
          Go Back
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-xl p-8 max-w-6xl mx-auto border border-gray-100"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {client ? `${client.name}'s Loans` : "Client Loans"}
          </h1>
          {client && (
            <p className="text-gray-600">Phone: {client.phone}</p>
          )}
        </motion.div>
        <motion.button 
          onClick={onBack}
          whileHover={{ scale: 1.05, backgroundColor: "#4B5563" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-600 text-white font-medium py-2 px-6 rounded-lg shadow-md mt-4 md:mt-0 transition-all duration-300"
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Client
          </div>
        </motion.button>
      </div>

      {loans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
        >
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">No loans found for this client</h2>
          <p className="mt-2 text-gray-500">This client doesn't have any active loans</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loans.map((loan) => (
            <motion.div 
              key={loan._id}
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300"
              onClick={() => handleViewLoanDetails(loan._id)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-gray-800"
                  >
                    {formatCurrency(loan.loanAmount)}
                  </motion.h3>
                  <motion.span 
                    variants={statusVariants}
                    initial="initial"
                    animate="animate"
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      loan.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 
                      loan.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                      'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    {loan.status || "Pending"}
                  </motion.span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Loan Type</span>
                    <span className="font-medium text-gray-800">{loan.loanType || "Personal"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Interest Rate</span>
                    <span className="font-medium text-gray-800">{loan.interestRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">EMI Amount</span>
                    <span className="font-medium text-gray-800">{formatCurrency(loan.emiAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tenure</span>
                    <span className="font-medium text-gray-800">
                      {loan.tenureMonths ? `${loan.tenureMonths} months` : loan.tenureDays ? `${loan.tenureDays} days` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Start Date</span>
                    <span className="font-medium text-gray-800">
                      {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-200">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm text-gray-500">Total Collected</span>
                      <p className="font-semibold text-gray-800 text-lg">
                        {loan.totalCollected !== undefined
                          ? formatCurrency(loan.totalCollected)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">EMIs Paid</span>
                      <p className="font-semibold text-gray-800 text-lg">
                        <span className="text-blue-600">{loan.paidEmis || 0}</span>
                        <span className="text-gray-400">/</span>
                        <span>{loan.totalEmis || loan.tenureMonths || loan.tenureDays}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {loan.paidEmis !== undefined && (loan.totalEmis || loan.tenureMonths || loan.tenureDays) && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (loan.paidEmis / (loan.totalEmis || loan.tenureMonths || loan.tenureDays)) * 100)}%` 
                          }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-2.5 rounded-full ${
                            loan.status === 'Completed' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                        ></motion.div>
                      </div>
                    </div>
                  )}
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="mt-5 flex justify-center"
                >
                  <button className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors duration-300 flex items-center">
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClientLoans;