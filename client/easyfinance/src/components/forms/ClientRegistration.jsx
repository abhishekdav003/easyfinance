import { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  IndianRupee,
  Percent,
  Calendar,
  Plus,
  Upload,
  X,
  Save,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { registerClient } from "../../services/api";

const AddClientForm = ({ onClientAdded, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    clientPhoto: "",
    loans: [],
    email: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("clientInfo"); // "clientInfo" or "loans"
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showNoLoanWarning, setShowNoLoanWarning] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation errors when user types
    if (name === "clientPhone") setPhoneError("");
    if (name === "clientName") setNameError("");
    if (apiError) setApiError("");
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        clientPhoto: file,
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoanChange = (index, field, value) => {
    const updatedLoans = [...formData.loans];
    updatedLoans[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      loans: updatedLoans,
    }));
  };

  const handleAddLoan = () => {
    setFormData((prev) => ({
      ...prev,
      loans: [
        ...prev.loans,
        {
          loanAmount: "",
          interestRate: "",
          tenureDays: "",
          tenureMonths: "",
          emiType: "Daily",
          startDate: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    setShowNoLoanWarning(false);
  };

  const handleRemoveLoan = (index) => {
    const updatedLoans = formData.loans.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      loans: updatedLoans,
    }));
  };

  const validateForm = () => {
    let isValid = true;

    // Phone validation (simple check for digits only)
    const phoneRegex = /^\d+$/;
    if (formData.clientPhone && !phoneRegex.test(formData.clientPhone)) {
      setPhoneError("Phone number should contain only digits");
      isValid = false;
    }

    // Validate loan fields when present
    if (formData.loans.length > 0) {
      for (let i = 0; i < formData.loans.length; i++) {
        const loan = formData.loans[i];

        // Check for required fields as per API
        if (!loan.loanAmount || !loan.interestRate) {
          // Don't need to validate tenureDays here since we're calculating it from tenureMonths if needed in the API
          setApiError(
            `Loan #${
              i + 1
            } is missing required fields (amount or interest rate)`
          );
          isValid = false;
          break;
        }

        // Numeric validation for loan fields
        if (
          isNaN(Number(loan.loanAmount)) ||
          isNaN(Number(loan.interestRate))
        ) {
          setApiError(
            `Loan #${
              i + 1
            } has invalid amount or interest rate (must be numbers)`
          );
          isValid = false;
          break;
        }

        // Ensure either tenureDays or tenureMonths is provided for Monthly loans
        if (
          loan.emiType === "Monthly" &&
          !loan.tenureMonths &&
          !loan.tenureDays
        ) {
          setApiError(
            `Loan #${i + 1} must have either Tenure Days or Tenure Months`
          );
          isValid = false;
          break;
        }

        // For Daily loans, we need tenureDays
        if (loan.emiType === "Daily" && !loan.tenureDays) {
          setApiError(
            `Loan #${i + 1} must have Tenure Days specified for Daily EMI type`
          );
          isValid = false;
          break;
        }
      }
    }

    return isValid;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setActiveTab("loans");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If no loans, show warning
    if (formData.loans.length === 0 && !showNoLoanWarning) {
      setShowNoLoanWarning(true);
      return;
    }

    // Reset warning if user confirms
    setShowNoLoanWarning(false);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const formToSend = new FormData();
      formToSend.append("clientName", formData.clientName);
      formToSend.append("clientPhone", formData.clientPhone);
      formToSend.append("clientAddress", formData.clientAddress);
      formToSend.append("email", formData.email);

      // Convert loans array to JSON string as required by the API
      if (formData.loans.length > 0) {
        formToSend.append("loans", JSON.stringify(formData.loans));
      }

      // Only append file if it exists
      if (formData.clientPhoto) {
        formToSend.append("file", formData.clientPhoto);
      }

      console.log("form data: ", formData);

      // Call the API function
      const response = await registerClient(formToSend);

      // Handle successful response
      alert("Client added successfully!");

      // Reset form
      setFormData({
        clientName: "",
        clientPhone: "",
        clientAddress: "",
        clientPhoto: null,
        loans: [],
        email: "",
      });
      setPreviewImage(null);

      // Notify parent component
      if (onClientAdded) onClientAdded();

      // Close form if onClose is provided
      if (onClose) onClose();
    } catch (err) {
      console.error("Error adding client:", err);

      // Extract error message from API response if available
      const errorMessage =
        err.response?.data?.message ||
        (err.message === "Client already exists"
          ? "Client with this name or phone already exists"
          : err.message);

      setApiError(errorMessage);

      if (
        errorMessage === "Client already exists" ||
        errorMessage.includes("already exists")
      ) {
        setNameError("A client with this name or phone number already exists");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto relative">
      {/* Close button in the top-right corner */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close form"
        >
          <XCircle size={24} />
        </button>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Client</h2>

      {/* API Error Message */}
      {apiError && (
        <div className="p-3 mb-4 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertTriangle size={18} className="mr-2" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "clientInfo"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("clientInfo")}
        >
          Client Information
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "loans"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("loans")}
        >
          Loan Details
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-6"
      >
        {/* Client Information Tab */}
        {activeTab === "clientInfo" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Client Photo Upload */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 mb-2">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Client"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <label className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100 transition">
                  <Upload size={16} className="mr-2" />
                  Upload Photo
                  <input
                    type="file"
                    onChange={handlePicChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Photo is optional</p>
              </div>

              {/* Client Details */}
              <div className="w-full md:w-2/3 space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Client Name"
                    className={`pl-10 w-full py-3 px-4 border ${
                      nameError ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                    required
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-500">{nameError}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className={`pl-10 w-full py-3 px-4 border ${
                      phoneError ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                    required
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                  )}
                </div>

                {/* Client Email (NEW FIELD) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <input
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    placeholder="Address"
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {onClose && (
                <button
                  type="button"
                  className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                onClick={handleNextStep}
              >
                Next: Loan Details
              </button>
            </div>
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === "loans" && (
          <div className="space-y-6">
            {/* No loan warning */}
            {showNoLoanWarning && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle
                    className="text-yellow-500 mr-3 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h3 className="font-medium text-yellow-800">
                      Create client without loans?
                    </h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      You're about to create a client without any loans. Click
                      Submit again to confirm, or add a loan below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.loans.map((loan, i) => (
              <div
                key={i}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveLoan(i)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  title="Remove Loan"
                >
                  <X size={18} />
                </button>

                <h3 className="font-medium text-gray-700 mb-4">
                  Loan #{i + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee size={18} className="text-gray-400" />
                    </div>
                    <input
                      value={loan.loanAmount}
                      onChange={(e) =>
                        handleLoanChange(i, "loanAmount", e.target.value)
                      }
                      placeholder="Loan Amount"
                      className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required={formData.loans.length > 0}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent size={18} className="text-gray-400" />
                    </div>
                    <input
                      value={loan.interestRate}
                      onChange={(e) =>
                        handleLoanChange(i, "interestRate", e.target.value)
                      }
                      placeholder="Interest Rate (%)"
                      className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required={formData.loans.length > 0}
                    />
                  </div>

                  {loan.emiType === "Daily" ? (
                    <div className="relative">
                      <input
                        value={loan.tenureDays}
                        onChange={(e) =>
                          handleLoanChange(i, "tenureDays", e.target.value)
                        }
                        placeholder="Tenure (Days) *required for Daily EMI"
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required={loan.emiType === "Daily"}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        value={loan.tenureMonths}
                        onChange={(e) =>
                          handleLoanChange(i, "tenureMonths", e.target.value)
                        }
                        placeholder="Tenure (Months) *required for Monthly EMI"
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        required={loan.emiType === "Monthly"}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <select
                      value={loan.emiType}
                      onChange={(e) =>
                        handleLoanChange(i, "emiType", e.target.value)
                      }
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none bg-white"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={loan.startDate}
                      onChange={(e) =>
                        handleLoanChange(i, "startDate", e.target.value)
                      }
                      className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                {loan.emiType === "Daily" && !loan.tenureDays && (
                  <p className="mt-2 text-sm text-red-500">
                    Tenure Days is required for Daily EMI type
                  </p>
                )}

                {loan.emiType === "Monthly" &&
                  !loan.tenureMonths &&
                  !loan.tenureDays && (
                    <p className="mt-2 text-sm text-red-500">
                      Either Tenure Months or Days is required for Monthly EMI
                      type
                    </p>
                  )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddLoan}
              className="flex items-center justify-center py-2 px-4 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              <Plus size={16} className="mr-2" />
              Add Loan
            </button>

            {formData.loans.length === 0 && !showNoLoanWarning && (
              <div className="text-sm text-gray-500 italic">
                * You can submit the form without adding any loans if needed.
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                onClick={() => setActiveTab("clientInfo")}
              >
                Back to Client Info
              </button>

              <div className="space-x-3">
                {onClose && (
                  <button
                    type="button"
                    className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddClientForm;
