import React, { useState, useEffect } from "react";
import { loanDetails } from "../../services/api.js";
// import LoanDetailsShow from "../details/LoanDetail.jsx";
// import { getLoanDetailsById } from "../../services/api.js";
import { motion } from "framer-motion";
import { updateLoanStatus } from "../../services/api.js";

const ClientLoans = ({ clientId, onBack, onViewLoanDetails, darkMode = false }) => {
  const [loans, setLoans] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingLoanId, setProcessingLoanId] = useState(null);

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

  const handleMarkAsComplete = async (e, loanId) => {
    // Stop event propagation to prevent triggering the parent onClick (view loan details)
    e.stopPropagation();
    
    try {
      setProcessingLoanId(loanId);
      
      // Call the updateLoanStatus API with the loan ID and status "Completed"
      const response = await updateLoanStatus(clientId, loanId, { newstatus: "Completed" });
      
      if (response && response.data.data) {
        // Update the local state to reflect the change
        setLoans(loans.map(loan => {
          if (loan._id === loanId) {
            return { ...loan, status: "Completed" };
          }
          return loan;
        }));
        
        console.log("Loan marked as complete:", loanId);
      }
    } catch (err) {
      setError(`Failed to update loan status: ${err.message}`);
      console.error("Error updating loan status:", err);
    } finally {
      setProcessingLoanId(null);
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
      <div className={`flex justify-center items-center h-full py-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
          }}
          className={`h-16 w-16 border-4 rounded-full ${
            darkMode ? 'border-t-blue-400 border-blue-700' : 'border-t-blue-500 border-blue-200'
          }`}
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
        className={`${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-5 rounded shadow-md m-6`} 
        role="alert"
      >
        <div className="flex items-center">
          <svg className={`h-6 w-6 mr-3 ${darkMode ? 'text-red-400' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <strong className="font-bold text-lg">Error! </strong>
        </div>
        <p className="mt-2">{error}</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <motion.button 
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'} text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300`}
          >
            Go Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-100'} shadow-lg rounded-xl p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto border transition-colors duration-300`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-6 border-opacity-20 border-gray-500">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {client ? `${client.name}'s Loans` : "Client Loans"}
          </h1>
          {client && (
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Phone: {client.phone}</p>
          )}
        </motion.div>
        <div className="flex mt-4 md:mt-0 w-full md:w-auto">
          <motion.button 
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all duration-300 ml-auto`}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Client
            </div>
          </motion.button>
        </div>
      </div>

      {loans.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center py-16 rounded-xl border-2 border-dashed ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-gray-300' 
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}
        >
          <svg className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className={`mt-4 text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>No loans found for this client</h2>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This client doesn't have any active loans</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {loans.map((loan) => (
            <motion.div 
              key={loan._id}
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)" 
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              className={`${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } border rounded-xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer`}
              onClick={() => handleViewLoanDetails(loan._id)}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-5">
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}
                  >
                    {formatCurrency(loan.loanAmount)}
                  </motion.h3>
                  <motion.span 
                    variants={statusVariants}
                    initial="initial"
                    animate="animate"
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      loan.status === 'Active' 
                        ? darkMode ? 'bg-green-800 text-green-200 border-green-700' : 'bg-green-100 text-green-800 border-green-200'
                        : loan.status === 'Completed' 
                        ? darkMode ? 'bg-blue-800 text-blue-200 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200'
                        : darkMode ? 'bg-yellow-800 text-yellow-200 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    } border`}
                  >
                    {loan.status || "Pending"}
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Loan Type
                    </span>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {loan.loanType || "Standard"}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Rate
                    </span>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {loan.interestRate ? `${loan.interestRate}%` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      EMI
                    </span>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {loan.emiAmount ? formatCurrency(loan.emiAmount) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Date
                    </span>
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <div className={`mt-6 pt-5 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Collected</span>
                      <p className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {loan.totalCollected !== undefined
                          ? formatCurrency(loan.totalCollected)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>EMIs Paid</span>
                      <p className={`font-semibold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>{loan.paidEmis || 0}</span>
                        <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>/</span>
                        <span>{loan.totalEmis || loan.tenureMonths || loan.tenureDays}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  {loan.paidEmis !== undefined && (loan.totalEmis || loan.tenureMonths || loan.tenureDays) && (
                    <div className="mt-3">
                      <div className={`w-full rounded-full h-2.5 mt-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${Math.min(100, (loan.paidEmis / (loan.totalEmis || loan.tenureMonths || loan.tenureDays)) * 100)}%` 
                          }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-2.5 rounded-full ${
                            loan.status === 'Completed' 
                              ? darkMode ? 'bg-blue-400' : 'bg-blue-500'
                              : darkMode ? 'bg-green-400' : 'bg-green-500'
                          }`}
                        ></motion.div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-5 flex justify-between items-center">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    className={`${
                      darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                    } font-medium text-sm transition-colors duration-300 flex items-center`}
                  >
                    View Details
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                  
                  {/* Mark as Complete Button - Only show for Active loans */}
                  {loan.status !== 'Completed' && (
                    <motion.button
                      onClick={(e) => handleMarkAsComplete(e, loan._id)}
                      disabled={processingLoanId === loan._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 flex items-center`}
                    >
                      {processingLoanId === loan._id ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                      Mark Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Responsive footer with additional navigation on small screens */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} md:hidden`}
      >
        <div className="flex justify-between items-center">
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {loans.length} {loans.length === 1 ? 'loan' : 'loans'} found
          </p>
          <motion.button 
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            } py-2 px-4 rounded-lg text-sm transition-all duration-300`}
          >
            Back
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ClientLoans;