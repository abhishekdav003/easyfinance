import React, { useEffect, useState } from "react";
import { fetchDefaultemis } from "../../services/api"; // assume this takes clientId
import { X } from "lucide-react";

const DefaultEmiViewer = ({ clientId, onClose }) => {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmis = async () => {
      try {
        const data = await fetchDefaultemis(clientId); // GET /clients/:clientId/default-emis
        setEmis(data);
      } catch (err) {
        console.error("Failed to load EMIs", err);
      } finally {
        setLoading(false);
      }
    };
    loadEmis();
  }, [clientId]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!emis || emis.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Default EMIs</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-500 text-center py-8">No default EMIs found.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/90 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl relative">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Default EMIs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {emis.map((emi, index) => (
                <tr key={emi._id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {emi.clientId?.clientName || "Atul"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {emi.amount || "₹10,000"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(emi.date || new Date()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-red-600 font-medium">Defaulted</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {emi.loanId || "6822c967efe0ea3dfd149124"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                      Pay Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DefaultEmiViewer;