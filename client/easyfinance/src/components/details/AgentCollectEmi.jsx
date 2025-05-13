import { useState, useEffect } from "react";
import { AgentcollectEMI, getClientDetails } from "../../services/agentAPI";

const AgentEmiCollection = ({ clientId, loanId, onClose }) => {
  const [client, setClient] = useState({});
  const [loan, setLoan] = useState(null);
  const [formData, setFormData] = useState({
    amountCollected: "",
    status: "Paid",
    location: { coordinates: [0, 0], address: "Unknown location" },
    paymentMode: "Cash",
    recieverName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const res = await getClientDetails(clientId);
        if (res.statusCode === 200) {
          setClient(res.data);
          const loanData = res.data.loans.find((l) => l._id === loanId);
          if (loanData) {
            setLoan(loanData);
            setFormData((prev) => ({
              ...prev,
              amountCollected: loanData.emiAmount || "",
            }));
          } else {
            setError("Loan not found.");
          }
        } else {
          setError(res.message || "Failed to fetch client");
        }
      } catch (err) {
        setError("Error fetching client: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    const getLocation = () => {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const address = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
          setFormData((prev) => ({
            ...prev,
            location: { coordinates: [lng, lat], address },
          }));
        },
        (err) => {
          console.error("Location error:", err);
        }
      );
    };

    fetchClient();
    getLocation();
  }, [clientId, loanId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AgentcollectEMI(clientId, loanId, {
        amountCollected: Number(formData.amountCollected),
        status: formData.status,
        location: formData.location,
        paymentMode: formData.paymentMode,
        recieverName: formData.paymentMode !== "Cash" ? formData.recieverName : "",
      });
  
      if (response?.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onClose) onClose();
          window.location.reload(); // ✅ reloads the page
        }, 1000);
      } else {
        setError("EMI submission failed");
      }
    } catch (err) {
      setError("Error collecting EMI");
    }
  };
  

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Collect EMI</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Client Name</label>
            <input
              type="text"
              value={client.clientName || ""}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Loan Amount</label>
            <input
              type="text"
              value={loan?.loanAmount || ""}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">EMI Amount</label>
            <input
              type="number"
              name="amountCollected"
              value={formData.amountCollected}
              onChange={(e) =>
                setFormData({ ...formData, amountCollected: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Defaulted">Defaulted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Location</label>
            <input
              type="text"
              value={formData.location.address}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={(e) =>
                setFormData({ ...formData, paymentMode: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Online">Online</option>
            </select>
          </div>
          {formData.paymentMode !== "Cash" && (
            <div>
              <label className="block text-sm text-gray-600">Receiver's Name</label>
              <input
                type="text"
                name="recieverName"
                value={formData.recieverName}
                onChange={(e) =>
                  setFormData({ ...formData, recieverName: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required={formData.paymentMode !== "Cash"}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Submit
          </button>

          {success && (
            <p className="text-green-600 mt-2">EMI collected successfully!</p>
          )}
        </form>
      )}

      <button
        onClick={onClose}
        className="mt-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>
    </div>
  );
};

export default AgentEmiCollection;
