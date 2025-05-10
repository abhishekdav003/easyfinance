import React, { useState, useEffect } from "react";
import { getClientDetailsById } from "../../services/api.js";
import { motion } from "framer-motion";
import { Loader, X, Phone, Users, MapPin, Mail, Calendar, BadgeCheck, Building, Home, CreditCard, Image, FileText, User, ChevronLeft } from "lucide-react";
import LocationDisplay from "./LocationDisplay.jsx";

// New component to display loan information
const ClientLoanInfo = ({ client, darkMode }) => {
  if (!client || !client.loans) return null;
  
  const activeLoans = client.loans.filter(loan => loan.status === 'Ongoing');
  const completedLoans = client.loans.filter(loan => loan.status === 'Completed');
  
  const cardStyle = `${darkMode 
    ? 'bg-gray-700/80 border-gray-700 text-gray-200' 
    : 'bg-gray-50 border-gray-200 text-gray-800'} 
    rounded-lg border p-4 transition-all duration-300`;
    
  const statusBadgeStyle = activeLoans.length > 0 
    ? `${darkMode ? 'bg-green-600' : 'bg-green-500'} text-white` 
    : `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`;
    
  return (
    <div className={cardStyle}>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <CreditCard className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
        Loan Summary
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-md shadow-sm`}>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Client Name</div>
          <div className="font-medium">{client.clientName}</div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-md shadow-sm`}>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Loans</div>
          <div className="font-medium">{activeLoans.length}</div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-md shadow-sm`}>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed Loans</div>
          <div className="font-medium">{completedLoans.length}</div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center">
        <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">Loan Status:</span>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadgeStyle}`}>
          {activeLoans.length > 0 ? "Active" : "No Active Loans"}
        </span>
      </div>
    </div>
  );
};

const ClientDetails = ({ clientId, onBack, onViewLoans, darkMode = false }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const clientData = await getClientDetailsById(clientId);
        
        // if (!clientData.data.status) {
        //   clientData.data.status = "Ongoing";
        // }
        const allLoansCompleted = clientData.data.loans?.every(
          (loan) => loan.totalAmountLeft <= 0
        );
        if (allLoansCompleted && clientData.data.status === "Ongoing") {
          clientData.data.status = "Completed"; // for UI
        }
        setClient(clientData.data);
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

  const openImageViewer = (imageUrl, imageType) => {
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        type: imageType
      });
    }
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  // Default avatar if no photo is available
  const defaultAvatar = "https://avatar.iran.liara.run/public/2";

  // Card style based on dark mode
  const cardStyle = `${darkMode 
    ? 'bg-gray-800/80 border-gray-700 hover:shadow-blue-900/10' 
    : 'bg-white border-gray-100'} 
    rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg`;

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-full min-h-[60vh] ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
        <div className="flex flex-col items-center">
          <Loader className="h-12 w-12 animate-spin" />
          <p className={`mt-3 font-medium animate-pulse ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
            Loading client details...
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
        className={`${darkMode 
          ? 'bg-red-900/30 border-red-700 text-red-200' 
          : 'bg-red-50 border-red-500 text-red-700'} 
          border-l-4 p-6 rounded-lg shadow-md max-w-xl mx-auto mt-10`}
        role="alert"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold">Error</h3>
            <p className="mt-1">{error}</p>
            <button
              onClick={handleBack}
              className={`mt-4 ${darkMode 
                ? 'bg-red-700 hover:bg-red-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'} 
                font-medium py-2 px-4 rounded-md transition-colors duration-300 shadow-md flex items-center`}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
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
        <svg className={`mx-auto h-16 w-16 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className={`mt-4 text-xl font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Client not found
        </h2>
        <button
          onClick={handleBack}
          className={`mt-4 ${darkMode 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'} 
            font-medium py-2 px-5 rounded-md shadow-md transition-all duration-300 transform hover:scale-105 flex items-center mx-auto`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </motion.div>
    );
  }

  // Status configuration for consistent styling


  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${darkMode 
        ? 'bg-gray-800 border-gray-700 text-gray-200' 
        : 'bg-white border-gray-100 text-gray-800'} 
        shadow-lg rounded-xl p-4 md:p-6 max-w-5xl mx-auto my-6 border transition-colors duration-300`}
    >
      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 overflow-hidden">
          <div className={`relative max-w-4xl w-full max-h-[90vh] overflow-auto p-2 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl`}>
            <button 
              onClick={closeImageViewer}
              className={`absolute right-3 top-3 rounded-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-2 shadow-lg z-10 hover:bg-red-500 hover:text-white transition-colors duration-300`}
            >
              <X size={24} />
            </button>
            
            <div className="pt-10 pb-6 px-6">
              <h3 className={`text-center text-xl font-bold mb-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {selectedImage.type}
              </h3>
              <div className="flex justify-center">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.type}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-4"
        >
          <button
            onClick={handleBack}
            className={`flex items-center ${darkMode 
              ? 'text-gray-300 hover:text-blue-400' 
              : 'text-gray-700 hover:text-blue-600'} 
              font-medium transition-colors duration-300`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold flex items-center"
          >
            <User className={`w-7 h-7 md:w-8 md:h-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            Client Details
          </motion.h1>
          
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button
              onClick={handleViewLoans}
              className={`${darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'} 
                font-medium py-2.5 px-5 rounded-lg transition-all duration-300 shadow-md flex items-center text-sm md:text-base hover:shadow-lg`}
            >
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" />
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
        className={`flex flex-col md:flex-row items-center mb-8 ${darkMode 
          ? 'bg-gradient-to-br from-blue-900/30 to-gray-800/50' 
          : 'bg-gradient-to-br from-blue-50 to-white'} 
          p-6 md:p-8 rounded-xl shadow-md transition-colors duration-300`}
      >
        <div className="mb-6 md:mb-0 md:mr-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl group">
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
                className="absolute bottom-0 right-0 w-7 h-7 md:w-8 md:h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center"
              >
                <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.div>
            )}
          </div>
        </div>
        <div className="text-center md:text-left flex-1">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-2"
          >
            {client.clientName || "Client Name"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 flex items-center justify-center md:justify-start`}
          >
            <Mail className={`w-4 h-4 md:w-5 md:h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            {client.email || "No email provided"}
          </motion.p>
        </div>
      </motion.div>

      {/* Loan Information Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mb-6"
      >
        <ClientLoanInfo client={client} darkMode={darkMode} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={`${cardStyle} p-5 md:p-6`}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className={`flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-32`}>Name:</span>
              <span className="font-medium">
                {client.clientName || "N/A"}
              </span>
            </div>
            <div className={`flex flex-col ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Phone Numbers:</span>
              <div className="space-y-2">
                {client.clientPhoneNumbers && client.clientPhoneNumbers.length > 0 ? (
                  client.clientPhoneNumbers.map((phone, index) => (
                    <div className="flex items-center" key={index}>
                      <Phone size={16} className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <span className="font-medium">{phone}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center">
                    <Phone size={16} className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <span className="font-medium">N/A</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-32`}>Email:</span>
              <span className="font-medium">{client.email || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-32`}>Client ID:</span>
              <span className={`font-medium text-sm ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'} px-3 py-1 rounded-md`}>
                {client._id}
              </span>
            </div>
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className={`${cardStyle} p-5 md:p-6`}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            System Information
          </h2>
          <div className="space-y-4">
            <div className={`flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-32`}>Created:</span>
              <div className="flex items-center">
                <Calendar className={`w-4 h-4 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className="font-medium">
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
           
          </div>
        </motion.div>
      </div>

      {/* Address Information */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className={`mt-6 ${cardStyle} p-5 md:p-6`}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          Address Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className={`flex flex-col ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Temporary Address:</span>
              <span className={`font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'} p-3 rounded-md`}>
                {client.temporaryAddress || "N/A"}
              </span>
            </div>
            <div className={`flex flex-col ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3 md:border-b-0 md:pb-0`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Permanent Address:</span>
              <span className={`font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'} p-3 rounded-md`}>
                {client.permanentAddress || "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className={`flex flex-col ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                <Building size={16} className="inline mr-2" />
                Shop Address:
              </span>
              <span className={`font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'} p-3 rounded-md`}>
                {client.shopAddress || "N/A"}
              </span>
            </div>
            <div className={`flex flex-col`}>
              <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                <Home size={16} className="inline mr-2" />
                House Address:
              </span>
              <span className={`font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-800'} p-3 rounded-md`}>
                {client.houseAddress || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Location Display */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="mt-6"
      >
        <LocationDisplay location={client.location} darkMode={darkMode} />
      </motion.div>

      {/* Referral Information */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className={`mt-6 ${cardStyle} p-5 md:p-6`}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Users className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          Referral Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`flex items-center ${darkMode ? 'border-gray-700' : 'border-gray-100'} border-b pb-3 md:border-b-0 md:pb-0`}>
            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-32`}>Referral Name:</span>
            <span className="font-medium">
              {client.referalName || "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-32`}>Referral Phone:</span>
            <span className="font-medium flex items-center">
              {client.referalNumber ? (
                <>
                  <Phone size={16} className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  {client.referalNumber}
                </>
              ) : "N/A"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Photo Gallery */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className={`mt-6 ${cardStyle} p-5 md:p-6`}
      >
        <h2 className="text-lg font-semibold mb-5 flex items-center">
          <Image className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          Photo Gallery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* ID Proof Photo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className={`${darkMode 
              ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600' 
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}
              p-4 rounded-lg border shadow-sm group cursor-pointer transition-all duration-300 hover:shadow-md`}
            onClick={() => openImageViewer(client.clientPhoto || defaultAvatar, "ID Proof")}
          >
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 shadow-sm">
              <img 
                src={client.clientPhoto || defaultAvatar} 
                alt="ID Proof" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
            </div>
            <h3 className="text-sm font-medium text-center">ID Proof</h3>
          </motion.div>
          
          {/* Shop Photo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className={`${darkMode 
              ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600' 
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}
              p-3 rounded-lg border shadow-sm group cursor-pointer transition-all duration-300`}
            onClick={() => openImageViewer(client.shopPhoto || defaultAvatar, "Shop Photo")}
          >
            <div className="aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
              <img 
                src={client.shopPhoto || defaultAvatar} 
                alt="Shop Photo" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
            </div>
            <h3 className="text-sm font-medium text-center">Shop Photo</h3>
          </motion.div>
          
          {/* House Photo */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className={`${darkMode 
              ? 'bg-gray-700/50 hover:bg-gray-700 border-gray-600' 
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}
              p-3 rounded-lg border shadow-sm group cursor-pointer transition-all duration-300`}
            onClick={() => openImageViewer(client.housePhoto || defaultAvatar, "House Photo")}
          >
            <div className="aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
              <img 
                src={client.housePhoto || defaultAvatar} 
                alt="House Photo" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
            </div>
            <h3 className="text-sm font-medium text-center">House Photo</h3>
          </motion.div>
        </div>
      </motion.div>

      {/* Documents */}
      {client.documents && client.documents.length > 0 && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className={`mt-6 ${darkMode 
            ? 'bg-gray-800/80 border-gray-700 hover:shadow-lg hover:shadow-blue-900/10' 
            : 'bg-white border-gray-100 hover:shadow-md'} 
            p-4 md:p-6 rounded-xl shadow-sm border transition-shadow duration-300`}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.documents.map((doc, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-3 rounded-lg flex items-center transition-colors duration-300`}>
                <svg className={`w-6 h-6 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                <span className="truncate flex-1">{doc.split('/').pop() || doc}</span>
                <a 
                  href={doc} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`ml-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}

     {/* Notes Section
{client.notes && (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 1.0, duration: 0.5 }}
    className={`mt-6 ${darkMode 
      ? 'bg-gray-800/80 border-gray-700 hover:shadow-lg hover:shadow-blue-900/10' 
      : 'bg-white border-gray-100 hover:shadow-md'} 
      p-4 md:p-6 rounded-xl shadow-sm border transition-shadow duration-300`}
  >
    <h2 className="text-lg font-semibold mb-3 flex items-center">
      <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      Notes
    </h2>
    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg mt-2 whitespace-pre-wrap`}>
      {client.notes || "No notes available."}
    </div>
  </motion.div>
)} */}


{/* Action Buttons */}
<motion.div 
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ delay: 1.2, duration: 0.5 }}
  className="mt-6 flex flex-wrap gap-3 justify-end"
>
  <button
    onClick={handleBack}
    className={`flex items-center ${darkMode 
      ? 'text-gray-300 hover:text-blue-400' 
      : 'text-gray-700 hover:text-blue-600'} 
      font-medium transition-colors duration-300`}
  >
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
    Back
  </button>
  <button
    onClick={() => setShowEditModal(true)}
    className={`${
      darkMode 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 text-white'
    } px-4 py-2 rounded-lg transition-colors duration-300 flex items-center`}
  >
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
    </svg>
    Edit Client
  </button>
  
</motion.div>

</motion.div>
);
};



export default ClientDetails;


