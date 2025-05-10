import React, { useEffect, useState } from "react";
import { getAgentEmiCollection } from "../../services/api.js"; // adjust path
import { X, Loader2 } from "lucide-react";

const AgentEmiCollectionModal = ({ agentId, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [collectionData, setCollectionData] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (agentId && open) {
      setLoading(true);
      getAgentEmiCollection(agentId)
        .then((res) => {
            console.log(res);
            setCollectionData(res.data.emiCollectionData); 
          setTotal(res.data.totalCollected);
          setError("");
        })
        .catch(() => {
          setError("Failed to fetch collection data.");
          setCollectionData([]);
        })
        .finally(() => setLoading(false));
    }
  }, [agentId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          EMI Collection for Agent ID: <span className="text-blue-600">{agentId}</span>
        </h2>

        {loading ? (
          <div className="flex justify-center items-center my-6">
            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="text-lg font-medium mb-4">
              Total Collected: ₹<span className="text-green-600">{total}</span>
            </p>

            {collectionData.length === 0 ? (
              <p className="text-gray-600">No EMI records found.</p>
            ) : (
              <ul className="space-y-3">
                {collectionData.map((emi, index) => (
                  <li
                    key={index}
                    className="border rounded-lg p-3 shadow-sm hover:bg-gray-50"
                  >
                    <div className="font-semibold">{emi.clientName}</div>
                    <div className="text-sm text-gray-600">
                      Loan: {emi.loanNumber} | ₹{emi.amountCollected} |{" "}
                      {new Date(emi.date).toLocaleDateString()} |{" "}
                      <span
                        className={
                          emi.status === "Paid"
                            ? "text-green-600"
                            : emi.status === "Partial"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {emi.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentEmiCollectionModal;
