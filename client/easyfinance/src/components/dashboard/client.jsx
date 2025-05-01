// components/clients/ClientManagement.jsx
import React, { useState, useEffect } from "react";
import { UserPlus, Menu, X, Eye, PlusCircle, Trash2 } from "lucide-react";
import { getAllClients, deleteClient } from "../../services/api";
import AddClientForm from "../forms/ClientRegistration";
import ClientDetails from "../details/ClientDetail";
import ClientLoans from "../details/ClientLoan";
import LoanDetailsShow from "../details/LoanDetail";
import AddLoanForm from "../details/AddLoan";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [viewMode, setViewMode] = useState("clients");
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [addingLoanClientId, setAddingLoanClientId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      alert(
        `Error fetching clients: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = () => {
    setShowForm(false);
    fetchClients();
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(clientId);
        alert("Client deleted successfully!");
        setClients(clients.filter((client) => client._id !== clientId));
      } catch (error) {
        console.error("Error deleting client:", error);
        alert(
          `Failed to delete client: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const toggleMobileActions = (clientId) => {
    setMobileMenuOpen(mobileMenuOpen === clientId ? null : clientId);
  };

  // Render client action buttons based on screen size
  const renderClientActions = (client) => {
    const isMenuOpen = mobileMenuOpen === client._id;

    return (
      <>
        {/* For medium and larger screens */}
        <div className="  hidden md:flex space-x-3">
          <button
            onClick={() => {
              setSelectedClientId(client._id);
              setViewMode("clientDetails");
            }}
            className="text-blue-600 hover:text-blue-900 flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>

          <button
            onClick={() => setAddingLoanClientId(client._id)}
            className="text-green-600 hover:text-green-900 flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Loan
          </button>

          <button
            onClick={() => handleDeleteClient(client._id)}
            className="text-red-600 hover:text-red-900 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>

        {/* For small screens */}
        <div className="md:hidden">
          <button
            onClick={() => toggleMobileActions(client._id)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {isMenuOpen && (
            <div className="absolute right-4 mt-2 bg-white shadow-lg rounded-md py-2 z-10 w-32">
              <button
                onClick={() => {
                  setSelectedClientId(client._id);
                  setViewMode("clientDetails");
                  setMobileMenuOpen(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
              <button
                onClick={() => {
                  setAddingLoanClientId(client._id);
                  setMobileMenuOpen(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Loan
              </button>
              <button
                onClick={() => {
                  handleDeleteClient(client._id);
                  setMobileMenuOpen(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
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
          />
        ) : viewMode === "clientLoans" ? (
          <ClientLoans
            clientId={selectedClientId}
            onBack={() => setViewMode("clientDetails")}
            onViewLoanDetails={(loanId) => {
              console.log("Clicked loanId:", loanId);
              setSelectedLoanId(loanId);
              setViewMode("loanDetails");
            }}
          />
        ) : viewMode === "loanDetails" ? (
          <LoanDetailsShow
            loanId={selectedLoanId}
            onBack={() => setViewMode("clientLoans")}
          />
        ) : null
      ) : (
        <>
          {/* Client List Header */}
          <div className="  mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h3 className="text-lg font-semibold">Client List</h3>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>

          {/* Add Client Form */}
          {showForm && <AddClientForm onClientAdded={handleClientAdded} />}

          {/* Client List Table for medium screens and up */}
          <div className="hidden sm:block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="hidden md:table-cell px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client, index) => (
                    <tr
                      key={client._id || index}
                      className="hover:bg-gray-50"
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
                              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm md:text-base">
                                {client.clientName
                                  ?.charAt(0)
                                  ?.toUpperCase() || "C"}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 md:ml-4">
                            <div className="text-xs md:text-sm font-medium text-gray-900">
                              {client.clientName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-gray-900">
                          {client.clientPhone}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {client.clientAddress}
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium relative">
                        {renderClientActions(client)}
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No clients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Card View for small screens */}
          <div className="sm:hidden mt-2 space-y-4">
            {clients.map((client, index) => (
              <div 
                key={client._id || index} 
                className="bg-white rounded-lg shadow-sm p-4 relative"
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
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {client.clientName
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {client.clientName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {client.clientPhone}
                    </div>
                  </div>
                  <div>
                    {renderClientActions(client)}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Address:</span> {client.clientAddress}
                </div>

                {addingLoanClientId === client._id && (
                  <div className="mt-4 border-t pt-4">
                    <AddLoanForm
                      clientId={client._id}
                      onClose={() => setAddingLoanClientId(null)}
                      onLoanAdded={() => {
                        fetchClients(); // Refresh after adding loan
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {clients.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 text-center text-sm text-gray-500">
                No clients found
              </div>
            )}
          </div>

          {/* Add Loan Form for medium+ screens */}
          <div className="hidden sm:block">
            {clients.map((client) => (
              addingLoanClientId === client._id && (
                <div key={client._id} className="mt-6">
                  <AddLoanForm
                    clientId={client._id}
                    onClose={() => setAddingLoanClientId(null)}
                    onLoanAdded={() => {
                      fetchClients(); // Refresh after adding loan
                    }}
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