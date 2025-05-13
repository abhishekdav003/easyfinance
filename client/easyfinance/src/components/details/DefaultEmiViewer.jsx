import React, { useEffect, useState } from "react";
import { fetchDefaultemis } from "../../services/api"; // assume this takes clientId

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

  if (loading) {
    return <div className="p-4 text-gray-500">Loading default EMIs...</div>;
  }

  if (!emis || emis.length === 0) {
    return <div className="p-4 text-gray-500">No default EMIs found.</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Default EMIs</h2>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Client Name</th> {/* 🆕 */}
              <th className="px-4 py-2 text-left">Amount Due</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Loan ID</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {emis.map((emi) => (
              <tr key={emi._id} className="border-t">
                <td className="px-4 py-2">{emi.clientId?.clientName || "Unknown"}</td>
                {/* 🆕 */}
                <td className="px-4 py-2">{emi.amountDue}</td>
                <td className="px-4 py-2">
                  {new Date(emi.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-red-600">Defaulted</td>
                <td className="px-4 py-2">{emi.loanId}</td>
                <td className="px-4 py-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    Pay Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DefaultEmiViewer;
