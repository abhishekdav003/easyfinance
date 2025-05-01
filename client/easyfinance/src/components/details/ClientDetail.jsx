import React, { useState, useEffect } from "react";
import { getClientDetailsById } from "../../services/api.js";
import { motion } from "framer-motion";

const ClientDetails = ({ clientId, onBack, onViewLoans }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const clientData = await getClientDetailsById(clientId);
        // ✅ Check loan status and adjust client status for UI

        if (!clientData.data.status) {
          clientData.data.status = "Ongoing";
        }
        const allLoansCompleted = clientData.data.loans?.every(
          (loan) => loan.totalAmountLeft <= 0
        );
        if (allLoansCompleted && clientData.data.status === "Ongoing") {
          clientData.data.status = "Completed"; // for UI
        }
        setClient(clientData.data);
        console.log("clientData", clientData.data);
      } catch (err) {
        setError("Failed to fetch client details: " + err.message);
        console.error("Error fetching client details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientDetails();
  }, [clientId]);

  const handleViewLoans = () => {
    if (onViewLoans) {
      onViewLoans();
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Default avatar if no photo is available
  const defaultAvatar = "https://avatar.iran.liara.run/public/2";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-blue-500 font-medium animate-pulse">Loading client details...</p>
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
        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-xl mx-auto mt-10"
        role="alert"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold">Error</h3>
            <p className="mt-1">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 shadow-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!client) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10"
      >
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">
          Client not found
        </h2>
        <button
          onClick={handleBack}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-md shadow-md transition-all duration-300 transform hover:scale-105 flex items-center mx-auto"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Go Back
        </button>
      </motion.div>
    );
  }
  console.log("Client status value:", client?.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg rounded-xl p-8 max-w-4xl mx-auto mt-10 border border-gray-100"
    >
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-4"
        >
          <button
            onClick={handleBack}
            className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back
          </button>
        </motion.div>
        
        <div className="flex justify-between items-center">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 flex items-center"
          >
            <svg className="w-8 h-8 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Client Details
          </motion.h1>
          
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button
              onClick={handleViewLoans}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg transition-all duration-300 shadow-md flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              View Loans
            </button>
          </motion.div>
        </div>
      </div>

      {/* Client Profile Header with Photo */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col md:flex-row items-center mb-8 bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-sm"
      >
        <div className="mb-4 md:mb-0 md:mr-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl group">
            <img
              src={client.clientPhoto || defaultAvatar}
              alt={`${client.clientName || "Client"} Photo`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
            {client.status === "Ongoing" && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5, type: "spring" }}
                className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </motion.div>
            )}
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-1"
          >
            {client.clientName || "Client Name"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-gray-600 mb-3 flex items-center justify-center md:justify-start"
          >
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            {client.email || "No email provided"}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-2"
          >
            {client && (
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                client.status === "Completed"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : client.status === "Ongoing"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : "bg-gray-100 text-gray-800 border border-gray-300"
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  client.status === "Completed" ? "bg-green-500" : 
                  client.status === "Ongoing" ? "bg-yellow-500" : "bg-gray-500"
                }`}></span>
                {client.status || "Unknown"}
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="flex border-b border-gray-100 pb-3">
              <span className="font-medium text-gray-600 w-32">Name:</span>
              <span className="text-gray-800 font-medium">
                {client.clientName || "N/A"}
              </span>
            </div>
            <div className="flex border-b border-gray-100 pb-3">
              <span className="font-medium text-gray-600 w-32">Phone:</span>
              <span className="text-gray-800 font-medium">
                {client.clientPhone || "N/A"}
              </span>
            </div>
            <div className="flex border-b border-gray-100 pb-3">
              <span className="font-medium text-gray-600 w-32">Address:</span>
              <span className="text-gray-800 font-medium">
                {client.clientAddress || "N/A"}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Email:</span>
              <span className="text-gray-800 font-medium">{client.email || "N/A"}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Additional Information
          </h2>
          <div className="space-y-4">
            <div className="flex border-b border-gray-100 pb-3">
              <span className="font-medium text-gray-600 w-32">Client ID:</span>
              <span className="text-gray-800 font-medium text-sm bg-gray-50 px-2 py-1 rounded">
                {client._id}
              </span>
            </div>
            <div className="flex border-b border-gray-100 pb-3">
              <span className="font-medium text-gray-600 w-32">Created:</span>
              <span className="text-gray-800 font-medium">
                {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  client.status === "Completed"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : client.status === "Ongoing"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {client.status || "Unknown"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {client.notes && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Notes
          </h2>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">{client.notes}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClientDetails;