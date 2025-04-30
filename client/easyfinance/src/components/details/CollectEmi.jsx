import { useState, useEffect } from "react";
import axios from "axios";
import { collectEMI } from "../../services/api.js";
import { getClientDetailsById } from "../../services/api.js";

function CollectEMI({
  clientId,
  loanId,
  onClose,
  embedded = false,
  isAgent = false,
}) {
  const [client, setClient] = useState({});
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  console.log("client", client);

  const [formData, setFormData] = useState({
    amountCollected: "",
    status: "paid",
    location: {
      coordinates: [0, 0],
      address: "Unknown location",
    },
  });

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const rolePrefix = isAgent ? "agent" : "admin";
        console.log(
          "Fetching client:",
          clientId,
          "via",
          `/api/v1/${rolePrefix}/getClientdata/${clientId}`
        );

        // const response = await axios.get(
        //   `http://localhost:8000/api/v1/admin/getClientdata/${clientId}`
        // );

        const response = await getClientDetailsById(clientId, {
          withCredentials: true,
        });

        console.log("response", response);

        if (response.statusCode === 200) {
          setClient(response.data);
          setClient(response);
          console.log("response.data", response.data);

          const loanData = response.data.loans.find((l) => l._id === loanId);
          if (loanData) {
            setLoan(loanData);
            setFormData((prev) => ({
              ...prev,
              amountCollected: loanData.emiAmount || "",
            }));
          } else {
            setError("Loan not found");
          }
        } else {
          setError(response.data.message || "Failed to fetch client details");
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching client details"
        );
        console.error("Error fetching client:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
    getLocation();
  }, [clientId, loanId]);

  const getLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const address = `Lat: ${coords.lat.toFixed(
            6
          )}, Lng: ${coords.lng.toFixed(6)}`;

          setUserLocation({
            coordinates: [coords.lng, coords.lat],
            address,
          });

          setFormData((prev) => ({
            ...prev,
            location: {
              coordinates: [coords.lng, coords.lat],
              address,
            },
          }));

          setGettingLocation(false);
        },
        (err) => {
          setLocationError(`Error getting location: ${err.message}`);
          setGettingLocation(false);
          console.error("Geolocation error:", err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting EMI for:", clientId, loanId, formData);
    if (!formData.amountCollected || formData.amountCollected <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (
      !userLocation ||
      !userLocation.coordinates ||
      userLocation.coordinates[0] === 0
    ) {
      setError(
        "Location access is required to submit this form. Please allow location."
      );
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      const response = await collectEMI(
        clientId,
        loanId,
        {
          amountCollected: Number(formData.amountCollected),
          status: formData.status,
          location: formData.location,
        },
        isAgent
      );

      if (response.data.success) {
        setSuccess(true);
        if (onClose) onClose();
      } else {
        setError(response.data.message || "Failed to collect EMI");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while collecting EMI"
      );
      console.error("Error collecting EMI:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBasedOnAmount = () => {
    if (!loan || !formData.amountCollected) return "paid";

    const amount = parseFloat(formData.amountCollected);
    const emiAmount = loan.emiAmount || 0;

    if (amount >= emiAmount) return "paid";
    if (amount > 0) return "partial";
    return "missed";
  };

  useEffect(() => {
    if (loan && formData.amountCollected) {
      const status = getStatusBasedOnAmount();
      setFormData((prev) => ({ ...prev, status }));
    }
  }, [formData.amountCollected, loan]);

  return (
    <div
      className={`flex flex-col ${
        !embedded ? "md:flex-row min-h-screen" : ""
      } bg-blue-50`}
    >
      {!embedded && <Sidebar activeItem="collections" />}
      <div className="flex flex-1 justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
            Collect EMI
          </h2>

          {loading ? (
            <div className="text-center text-blue-500">
              Loading client details...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center mb-4">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-blue-600 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={client?.data?.clientName || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-600 mb-1">
                  Loan Amount
                </label>
                <input
                  type="text"
                  value={loan?.loanAmount || ""}
                  readOnly
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-600 mb-1">
                  EMI Amount
                </label>
                <input
                  type="number"
                  name="amountCollected"
                  value={formData.amountCollected}
                  onChange={handleChange}
                  placeholder="Enter EMI Amount"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-600 mb-1">
                  EMI Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Paid">Paid</option>
                  <option value="Defaulted">Defaulted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-600 mb-1">
                  Current Location
                </label>
                <input
                  type="text"
                  value={userLocation?.address || "Fetching location..."}
                  readOnly
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-100"
                />
              </div>

              {locationError && (
                <div className="text-red-400 text-sm text-center">
                  {locationError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300"
              >
                {submitting ? "Submitting..." : "Collect EMI"}
              </button>

              {success && (
                <div className="text-green-500 text-center mt-2">
                  EMI Collected Successfully!
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectEMI;
