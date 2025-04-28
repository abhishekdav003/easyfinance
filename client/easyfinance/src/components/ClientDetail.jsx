import React, { useState, useEffect } from "react";
import { getClientDetailsById } from "../services/api.js";

const ClientDetails = ({ clientId, onBack, onViewLoans }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const clientData = await getClientDetailsById(clientId);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={handleBack}
          className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700">Client not found</h2>
        <button 
          onClick={handleBack}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Client Details</h1>
        <div>
          <button 
            onClick={handleBack}
            className="mr-3 bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
          >
            Back
          </button>
          <button 
            onClick={handleViewLoans}
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            View Loans
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Name:</span>
              <span className="text-gray-800">{client.clientName || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Phone:</span>
              <span className="text-gray-800">{client.clientPhone || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Address:</span>
              <span className="text-gray-800">{client.clientAddress || "N/A"}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Email:</span>
              <span className="text-gray-800">{client.email || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Additional Information</h2>
          <div className="space-y-3">
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Client ID:</span>
              <span className="text-gray-800">{client._id}</span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Created:</span>
              <span className="text-gray-800">
                {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex">
              <span className="font-medium text-gray-600 w-32">Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {client.status || "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {client.notes && (
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Notes</h2>
          <p className="text-gray-700">{client.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;
