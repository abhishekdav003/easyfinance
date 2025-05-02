import React, { useState } from "react";
import { 
  Search, 
  PlusCircle, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard,
  ArrowLeft,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Wallet
} from "lucide-react";
import { addClient } from "../../services/agentAPI";

const ClientManagement = ({ 
  clients, 
  selectedClientId, 
  setSelectedClientId, 
  showForm, 
  setShowForm, 
  handleClientAdded,
  searchTerm,
  setSearchTerm,
  handleSearchClients,
  collectingEmiClientId,
  setCollectingEmiClientId,
  handleEmiCollected,
  darkMode, 
  isMobile 
}) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    aadhar: "",
    pan: "",
    loanDetails: {
      amount: "",
      tenure: "",
      interest: "",
      startDate: ""
    }
  });
  
  const [errors, setErrors] = useState({});
  const [emiAmount, setEmiAmount] = useState("");
  const [emiDate, setEmiDate] = useState(new Date().toISOString().substr(0, 10));
  const [expandedClientId, setExpandedClientId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Clear error when field is being edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) newErrors.fullname = "Name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.aadhar.trim()) {
      newErrors.aadhar = "Aadhar is required";
    } else if (!/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = "Aadhar must be 12 digits";
    }
    
    if (!formData.pan.trim()) {
      newErrors.pan = "PAN is required";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = "Invalid PAN format";
    }
    
    // Loan validation can be expanded
    if (formData.loanDetails.amount && isNaN(formData.loanDetails.amount)) {
      newErrors['loanDetails.amount'] = "Amount must be a number";
    }
    
    return newErrors;
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      await addClient(formData);
      alert("Client added successfully!");
      setFormData({
        fullname: "",
        email: "",
        phone: "",
        address: "",
        aadhar: "",
        pan: "",
        loanDetails: {
          amount: "",
          tenure: "",
          interest: "",
          startDate: ""
        }
      });
      handleClientAdded();
    } catch (error) {
      console.error("Failed to add client:", error);
      alert(`Error adding client: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCollectEmi = () => {
    if (!emiAmount.trim() || isNaN(emiAmount)) {
      alert("Please enter a valid EMI amount");
      return;
    }
    
    handleEmiCollected(collectingEmiClientId, parseFloat(emiAmount), emiDate);
    setEmiAmount("");
    setEmiDate(new Date().toISOString().substr(0, 10));
  };

  const getCardBgClass = () => {
    return darkMode 
      ? 'bg-gray-800/70 border border-gray-700 shadow-md' 
      : 'bg-white/70 border border-gray-200 shadow';
  };
  
  const getInputBgClass = () => {
    return darkMode 
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  };
  
  const getButtonClass = (type) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: darkMode
        ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
        : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      secondary: darkMode
        ? "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500"
        : "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
      danger: darkMode
        ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
        : "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
      success: darkMode
        ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
        : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    };
    
    return `${baseClass} ${variants[type]}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
        <h3 className="text-xl font-semibold">Client Management</h3>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchClients()}
              className={`pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 ${getInputBgClass()}`}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className={getButtonClass('primary')}
          >
            <PlusCircle className="inline mr-1" size={18} /> Add Client
          </button>
        </div>
      </div>
      
      {/* Add Client Form */}
      {showForm && (
        <div className={`rounded-xl p-4 mb-6 ${getCardBgClass()}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <UserPlus size={20} className="mr-2 text-blue-500" />
              Add New Client
            </h3>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()} ${errors.fullname ? 'border-red-500' : ''}`}
                />
                {errors.fullname && <p className="mt-1 text-sm text-red-500">{errors.fullname}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number*
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()} ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()} ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address*
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()} ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aadhar Number*
                </label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()} ${errors.aadhar ? 'border-red-500' : ''}`}
                />
                {errors.aadhar && <p className="mt-1 text-sm text-red-500">{errors.aadhar}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PAN Number*
                </label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()} ${errors.pan ? 'border-red-500' : ''}`}
                />
                {errors.pan && <p className="mt-1 text-sm text-red-500">{errors.pan}</p>}
              </div>
            </div>
            
            {/* Loan Details Section */}
            <div className="mt-6">
              <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Loan Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loan Amount
                  </label>
                  <input
                    type="text"
                    name="loanDetails.amount"
                    value={formData.loanDetails.amount}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tenure (in months)
                  </label>
                  <input
                    type="text"
                    name="loanDetails.tenure"
                    value={formData.loanDetails.tenure}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Rate (%)
                  </label>
                  <input
                    type="text"
                    name="loanDetails.interest"
                    value={formData.loanDetails.interest}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()}`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="loanDetails.startDate"
                    value={formData.loanDetails.startDate}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={getButtonClass('secondary')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={getButtonClass('primary')}
              >
                Add Client
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* EMI Collection Form */}
      {collectingEmiClientId && (
        <div className={`rounded-xl p-4 mb-6 ${getCardBgClass()}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Wallet size={20} className="mr-2 text-green-500" />
              Collect EMI
            </h3>
            <button 
              onClick={() => setCollectingEmiClientId(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  EMI Amount (₹)*
                </label>
                <input
                  type="text"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()}`}
                  placeholder="Enter EMI amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Collection Date*
                </label>
                <input
                  type="date"
                  value={emiDate}
                  onChange={(e) => setEmiDate(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 ${getInputBgClass()}`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setCollectingEmiClientId(null)}
                className={getButtonClass('secondary')}
              >
                Cancel
              </button>
              <button
                onClick={handleCollectEmi}
                className={getButtonClass('success')}
              >
                Collect EMI
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Client List */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className={`rounded-xl p-8 text-center ${getCardBgClass()}`}>
            <div className="text-gray-500 dark:text-gray-400">
              No clients found. Add a new client to get started.
            </div>
          </div>
        ) : (
          <>
            {clients.map((client) => (
              <div 
                key={client._id} 
                className={`rounded-xl overflow-hidden ${getCardBgClass()}`}
              >
                {/* Client Card Header */}
                <div 
                  className={`p-4 cursor-pointer ${
                    expandedClientId === client._id ? (darkMode ? 'bg-gray-700/50' : 'bg-gray-50') : ''
                  }`}
                  onClick={() => setExpandedClientId(expandedClientId === client._id ? null : client._id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darkMode 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      } text-white font-bold shadow-md mr-3`}>
                        {client.fullname?.charAt(0) || "C"}
                      </div>
                      <div>
                        <h4 className="font-medium">{client.fullname}</h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Phone size={14} className="mr-1" />
                          {client.phone}
                          {client.email && (
                            <>
                              <span className="mx-2">•</span>
                              <Mail size={14} className="mr-1" />
                              {client.email}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollectingEmiClientId(client._id);
                        }}
                        className={`p-2 rounded-lg ${
                          darkMode 
                            ? 'bg-green-400/20 text-green-400 hover:bg-green-400/30' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        <Wallet size={18} />
                      </button>
                      
                      {expandedClientId === client._id ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Client Details */}
                {expandedClientId === client._id && (
                  <div className={`p-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Personal Details</h5>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <MapPin size={16} className="mr-2 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{client.address || 'No address provided'}</span>
                          </div>
                          
                          <div className="flex items-start">
                            <CreditCard size={16} className="mr-2 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Aadhar: {client.aadhar || 'Not provided'}
                            </span>
                          </div>
                          
                          <div className="flex items-start">
                            <FileText size={16} className="mr-2 text-gray-400 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              PAN: {client.pan || 'Not provided'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">Loan Information</h5>
                        <div className="space-y-2">
                          {client.loanDetails?.amount ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Loan Amount:</span>
                                <span className="text-sm font-medium">₹{parseFloat(client.loanDetails.amount).toLocaleString('en-IN')}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Tenure:</span>
                                <span className="text-sm font-medium">{client.loanDetails.tenure} months</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Interest Rate:</span>
                                <span className="text-sm font-medium">{client.loanDetails.interest}%</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Start Date:</span>
                                <span className="text-sm font-medium">
                                  {client.loanDetails.startDate 
                                    ? new Date(client.loanDetails.startDate).toLocaleDateString() 
                                    : 'Not specified'}
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">No loan details available</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* EMI History Section */}
                    <div className="mt-4">
                      <h5 className="font-medium mb-2 text-gray-700 dark:text-gray-300">EMI History</h5>
                      {client.emiHistory && client.emiHistory.length > 0 ? (
                        <div className={`rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className={darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {client.emiHistory.map((emi, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                                    {new Date(emi.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                                    ₹{parseFloat(emi.amount).toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${emi.status === 'paid' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-500' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-500'}`
                                    }>
                                      {emi.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                          No EMI records found for this client.
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit client functionality
                          console.log("Edit client", client._id);
                        }}
                        className={getButtonClass('secondary')}
                      >
                        <Edit size={16} className="mr-1" /> Edit
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollectingEmiClientId(client._id);
                        }}
                        className={getButtonClass('success')}
                      >
                        <Wallet size={16} className="mr-1" /> Collect EMI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;