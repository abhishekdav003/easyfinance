// components/clients/ClientManagement.jsx
import React, { useState, useEffect } from "react";
import { UserPlus, Menu, X, Eye, PlusCircle, Trash2, UserCircle, Search } from "lucide-react";
import { getAllClients, deleteClient } from "../../services/api";
import AddClientForm from "../forms/ClientRegistration";
import ClientDetails from "../details/ClientDetail";
import ClientLoans from "../details/ClientLoan";
import LoanDetailsShow from "../details/LoanDetail";
import AddLoanForm from "../details/AddLoan";

const ClientManagement = ({ 
  clients, 
  selectedClientId, 
  setSelectedClientId, 
  viewMode, 
  setViewMode, 
  showForm, 
  setShowForm, 
  handleClientAdded, 
  handleDeleteClient, 
  addingLoanClientId, 
  setAddingLoanClientId, 
  fetchClients, 
  selectedLoanId, 
  setSelectedLoanId,
  darkMode,
  isMobile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState(clients);

  useEffect(() => {
    // Reset mobile menu when client list changes
    setMobileMenuOpen(null);
    // Update filtered clients when clients change
    setFilteredClients(clients);
  }, [clients]);

  useEffect(() => {
    // Filter clients based on search term
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = clients.filter(client => 
        (client.clientName && client.clientName.toLowerCase().includes(term)) || 
        (client.clientPhoneNumbers && client.clientPhoneNumbers.some(phone => phone && phone.includes(term))) ||
        (client.permanentAddress && client.permanentAddress.toLowerCase().includes(term))
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const toggleMobileActions = (clientId) => {
    setMobileMenuOpen(mobileMenuOpen === clientId ? null : clientId);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Render client action buttons based on screen size
  const renderClientActions = (client) => {
    const isMenuOpen = mobileMenuOpen === client._id;

    return (
      <>
        {/* For medium and larger screens */}
        <div className="hidden md:flex space-x-3">
          <button
            onClick={() => {
              setSelectedClientId(client._id);
              setViewMode("clientDetails");
            }}
            className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'} flex items-center transition-colors`}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>

          <button
            onClick={() => setAddingLoanClientId(client._id)}
            className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'} flex items-center transition-colors`}
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Loan
          </button>

          <button
            onClick={() => handleDeleteClient(client._id)}
            className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'} flex items-center transition-colors`}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>

        {/* For small screens */}
        <div className="md:hidden">
          <button
            onClick={() => toggleMobileActions(client._id)}
            className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {isMenuOpen && (
            <div className={`absolute right-4 mt-2 ${
              darkMode 
                ? 'bg-gray-800 shadow-xl border border-gray-700' 
                : 'bg-white shadow-lg'
            } rounded-md py-2 z-10 w-32`}>
              <button
                onClick={() => {
                  setSelectedClientId(client._id);
                  setViewMode("clientDetails");
                  setMobileMenuOpen(null);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  darkMode 
                    ? 'text-blue-400 hover:bg-gray-700' 
                    : 'text-blue-600 hover:bg-blue-50'
                } flex items-center transition-colors`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              <button
                onClick={() => {
                  setAddingLoanClientId(client._id);
                  setMobileMenuOpen(null);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  darkMode 
                    ? 'text-green-400 hover:bg-gray-700' 
                    : 'text-green-600 hover:bg-green-50'
                } flex items-center transition-colors`}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Loan
              </button>
              <button
                onClick={() => {
                  handleDeleteClient(client._id);
                  setMobileMenuOpen(null);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  darkMode 
                    ? 'text-red-400 hover:bg-gray-700' 
                    : 'text-red-600 hover:bg-red-50'
                } flex items-center transition-colors`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      {selectedClientId ? (
        viewMode === "clientDetails" ? (
          <ClientDetails
            clientId={selectedClientId}
            onBack={() => setSelectedClientId(null)}
            onViewLoans={() => setViewMode("clientLoans")}
            darkMode={darkMode}
          />
        ) : viewMode === "clientLoans" ? (
          <ClientLoans
            clientId={selectedClientId}
            onBack={() => setViewMode("clientDetails")}
            onViewLoanDetails={(loanId) => {
              setSelectedLoanId(loanId);
              setViewMode("loanDetails");
            }}
            darkMode={darkMode}
          />
        ) : viewMode === "loanDetails" ? (
          <LoanDetailsShow
            loanId={selectedLoanId}
            onBack={() => setViewMode("clientLoans")}
            darkMode={darkMode}
          />
        ) : null
      ) : (
        <>
          {/* Client List Header */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Client List</h3>
            <button
              onClick={() => setShowForm(true)}
              className={`${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } px-3 py-2 sm:px-4 sm:py-2 rounded-md flex items-center transition-colors text-sm sm:text-base w-full sm:w-auto justify-center`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>

          {/* Search Bar */}
          <div className={`mb-4 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-lg p-3 shadow-sm`}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone or address..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`pl-10 pr-10 py-2 w-full rounded-md ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500' 
                    : 'border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                } transition-colors`}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
            </div>
          </div>

          {/* Add Client Form */}
          {showForm && <AddClientForm onClientAdded={handleClientAdded} darkMode={darkMode}   onClose={() => setShowForm(false)}  />}

          {/* Client List Table for medium screens and up */}
          <div className={`hidden sm:block ${
            darkMode 
              ? 'bg-gray-800 rounded-lg shadow-lg border border-gray-700' 
              : 'bg-white rounded-lg shadow-sm hover:shadow-md'
          } transition-shadow`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Name
                    </th>
                    <th className={`px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Phone
                    </th>
                    <th className={`hidden md:table-cell px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Address
                    </th>
                    <th className={`px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${
                  darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'
                }`}>
                  {filteredClients.map((client, index) => (
                    <tr
                      key={client._id || index}
                      className={darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                            {client.clientPhoto ? (
                              <img
                                className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
                                src={client.clientPhoto}
                                alt=""
                              />
                            ) : (
                              <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full ${
                                darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                              } flex items-center justify-center text-sm md:text-base`}>
                                {client.clientName
                                  ?.charAt(0)
                                  ?.toUpperCase() || "C"}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 md:ml-4">
                            <div className={`text-xs md:text-sm font-medium ${
                              darkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {client.clientName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                        <div className={`text-xs md:text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {client.clientPhoneNumbers[0]}
                        </div>
                      </td>
                      <td className={`hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        <div>
                          {client.permanentAddress}
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium relative">
                        {renderClientActions(client)}
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className={`px-6 py-4 text-center text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        No clients found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Card View for small screens */}
          <div className="sm:hidden mt-2 space-y-4">
            {filteredClients.map((client, index) => (
              <div 
                key={client._id || index} 
                className={`${
                  darkMode 
                    ? 'bg-gray-800 shadow-lg border border-gray-700' 
                    : 'bg-white shadow-sm'
                } rounded-lg p-4 relative transition-all`}
              >
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    {client.clientPhoto ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={client.clientPhoto}
                        alt=""
                      />
                    ) : (
                      <div className={`h-10 w-10 rounded-full ${
                        darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                      } flex items-center justify-center`}>
                        {client.clientName
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className={`text-sm font-medium ${
                      darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {client.clientName}
                    </div>
                    <div className={`text-xs ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {client.clientPhoneNumbers?.[0]}
                    </div>
                  </div>
                  <div>
                    {renderClientActions(client)}
                  </div>
                </div>
                
                <div className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                } mt-1`}>
                  <span className="font-medium">Address:</span> {client.permanentAddress}
                </div>

                {addingLoanClientId === client._id && (
                  <div className={`mt-4 border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  } pt-4`}>
                    <AddLoanForm
                      clientId={client._id}
                      onClose={() => setAddingLoanClientId(null)}
                      onLoanAdded={() => {
                        fetchClients(); // Refresh after adding loan
                      }}
                      darkMode={darkMode}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {filteredClients.length === 0 && (
              <div className={`${
                darkMode 
                  ? 'bg-gray-800 text-gray-400 border border-gray-700' 
                  : 'bg-white text-gray-500'
              } rounded-lg shadow-sm p-4 text-center text-sm`}>
                No clients found matching your search
              </div>
            )}
          </div>

          {/* Add Loan Form for medium+ screens */}
          <div className="hidden sm:block">
            {clients.map((client) => (
              addingLoanClientId === client._id && (
                <div key={client._id} className={`mt-6 ${
                  darkMode 
                    ? 'bg-gray-800/80 border border-gray-700 rounded-lg shadow-lg' 
                    : 'bg-white/80 rounded-lg shadow-md'
                } p-4`}>
                  <AddLoanForm
                    clientId={client._id}
                    onClose={() => setAddingLoanClientId(null)}
                    onLoanAdded={() => {
                      fetchClients(); // Refresh after adding loan
                    }}
                    darkMode={darkMode}
                  />
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientManagement;