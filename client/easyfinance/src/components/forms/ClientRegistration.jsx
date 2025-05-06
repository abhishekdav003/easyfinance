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
  Mail,
  Home,
  Store,
  FileText,
} from "lucide-react";
import { registerClient } from "../../services/api";

const AddClientForm = ({ onClientAdded, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    temporaryAddress: "",
    permanentAddress: "",
    shopAddress: "",
    houseAddress: "",
    clientPhoto: null,
    shopPhoto: null,
    housePhoto: null,
    documents: [],
    loans: [],
    email: "",
  });

  const [previewImages, setPreviewImages] = useState({
    clientPhoto: null,
    shopPhoto: null,
    housePhoto: null,
  });
  
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("clientInfo"); // "clientInfo", "addressInfo", "photoDocuments", or "loans"
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

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: file,
      }));

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === "clientPhoto" || fieldName === "shopPhoto" || fieldName === "housePhoto") {
          setPreviewImages(prev => ({
            ...prev,
            [fieldName]: reader.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 10 documents maximum
      const limitedFiles = files.slice(0, 10);
      
      setFormData((prev) => ({
        ...prev,
        documents: [...limitedFiles],
      }));

      // Create previews for documents
      const newPreviews = [];
      limitedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            name: file.name,
            url: reader.result
          });
          if (newPreviews.length === limitedFiles.length) {
            setDocumentPreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
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

  const removeDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    
    const updatedPreviews = [...documentPreviews];
    updatedPreviews.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      documents: updatedDocuments
    }));
    setDocumentPreviews(updatedPreviews);
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
          setApiError(
            `Loan #${i + 1} is missing required fields (amount or interest rate)`
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
            `Loan #${i + 1} has invalid amount or interest rate (must be numbers)`
          );
          isValid = false;
          break;
        }

        // Validate tenure based on EMI type
        if (loan.emiType === "Daily" && !loan.tenureDays) {
          setApiError(
            `Loan #${i + 1} must have Tenure Days specified for Daily EMI type`
          );
          isValid = false;
          break;
        }

        if (loan.emiType === "Monthly" && !loan.tenureMonths && !loan.tenureDays) {
          setApiError(
            `Loan #${i + 1} must have either Tenure Months or Tenure Days specified for Monthly EMI type`
          );
          isValid = false;
          break;
        }
        
        if (loan.emiType === "Weekly" && !loan.tenureDays) {
          setApiError(
            `Loan #${i + 1} must have Tenure Days specified for Weekly EMI type`
          );
          isValid = false;
          break;
        }
        
        if (loan.emiType === "Full Payment" && !loan.tenureDays) {
          setApiError(
            `Loan #${i + 1} must have Tenure Days specified for Full Payment type`
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
      if (activeTab === "clientInfo") {
        setActiveTab("addressInfo");
      } else if (activeTab === "addressInfo") {
        setActiveTab("photoDocuments");
      } else if (activeTab === "photoDocuments") {
        setActiveTab("loans");
      }
    }
  };

  const handlePreviousStep = () => {
    if (activeTab === "loans") {
      setActiveTab("photoDocuments");
    } else if (activeTab === "photoDocuments") {
      setActiveTab("addressInfo");
    } else if (activeTab === "addressInfo") {
      setActiveTab("clientInfo");
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
      
      // Add client information
      formToSend.append("clientName", formData.clientName);
      formToSend.append("clientPhone", formData.clientPhone);
      formToSend.append("email", formData.email);
      
      // Add address information
      formToSend.append("temporaryAddress", formData.temporaryAddress);
      formToSend.append("permanentAddress", formData.permanentAddress);
      formToSend.append("shopAddress", formData.shopAddress);
      formToSend.append("houseAddress", formData.houseAddress);
      
      // Add photos
      if (formData.clientPhoto) {
        formToSend.append("clientPhoto", formData.clientPhoto);
      }
      
      if (formData.shopPhoto) {
        formToSend.append("shopPhoto", formData.shopPhoto);
      }
      
      if (formData.housePhoto) {
        formToSend.append("housePhoto", formData.housePhoto);
      }
      
      // Add documents
      if (formData.documents.length > 0) {
        formData.documents.forEach(doc => {
          formToSend.append("documents", doc);
        });
      }

      // Convert loans array to JSON string as required by the API
      if (formData.loans.length > 0) {
        formToSend.append("loans", JSON.stringify(formData.loans));
      }

      console.log("Submitting form data");

      // Call the API function
      const response = await registerClient(formToSend);

      // Handle successful response
      alert("Client added successfully!");

      // Reset form
      setFormData({
        clientName: "",
        clientPhone: "",
        temporaryAddress: "",
        permanentAddress: "",
        shopAddress: "",
        houseAddress: "",
        clientPhoto: null,
        shopPhoto: null,
        housePhoto: null,
        documents: [],
        loans: [],
        email: "",
      });
      setPreviewImages({
        clientPhoto: null,
        shopPhoto: null,
        housePhoto: null,
      });
      setDocumentPreviews([]);

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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto md:mb-2xl relative">
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
      <div className="flex flex-wrap border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "clientInfo"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("clientInfo")}
        >
          Client Info
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "addressInfo"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("addressInfo")}
        >
          Addresses
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "photoDocuments"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("photoDocuments")}
        >
          Photos & Documents
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
            <div className="w-full space-y-4">
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

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
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
                Next: Addresses
              </button>
            </div>
          </div>
        )}

        {/* Address Information Tab */}
        {activeTab === "addressInfo" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Temporary Address</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <textarea
                    name="temporaryAddress"
                    value={formData.temporaryAddress}
                    onChange={handleChange}
                    placeholder="Enter temporary address"
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows="3"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Permanent Address</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home size={18} className="text-gray-400" />
                  </div>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    placeholder="Enter permanent address"
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Shop Address</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store size={18} className="text-gray-400" />
                  </div>
                  <textarea
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleChange}
                    placeholder="Enter shop address"
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">House Address</h3>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home size={18} className="text-gray-400" />
                  </div>
                  <textarea
                    name="houseAddress"
                    value={formData.houseAddress}
                    onChange={handleChange}
                    placeholder="Enter house address"
                    className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button
                type="button"
                className="py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                onClick={handleNextStep}
              >
                Next: Photos & Documents
              </button>
            </div>
          </div>
        )}

        {/* Photos & Documents Tab */}
        {activeTab === "photoDocuments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client Photo */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Client Photo</h3>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 mb-2">
                    {previewImages.clientPhoto ? (
                      <img
                        src={previewImages.clientPhoto}
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
                      onChange={(e) => handleFileChange(e, "clientPhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Photo is optional</p>
                </div>
              </div>

              {/* Shop Photo */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">Shop Photo</h3>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 mb-2">
                    {previewImages.shopPhoto ? (
                      <img
                        src={previewImages.shopPhoto}
                        alt="Shop"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store size={40} className="text-gray-400" />
                    )}
                  </div>
                  <label className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100 transition">
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "shopPhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Photo is optional</p>
                </div>
              </div>

              {/* House Photo */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700 mb-2">House Photo</h3>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 mb-2">
                    {previewImages.housePhoto ? (
                      <img
                        src={previewImages.housePhoto}
                        alt="House"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Home size={40} className="text-gray-400" />
                    )}
                  </div>
                  <label className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100 transition">
                    <Upload size={16} className="mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "housePhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Photo is optional</p>
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-700 mb-4">Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="flex flex-col items-center">
                  <FileText size={40} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">
                    Upload client documents (ID proof, address proof, etc.)
                  </p>
                  <label className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100 transition">
                    <Upload size={16} className="mr-2" />
                    Select Files
                    <input
                      type="file"
                      onChange={handleDocumentsChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      multiple
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 10 documents
                  </p>
                </div>

                {/* Document Preview List */}
                {documentPreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      Selected Documents ({documentPreviews.length})
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {documentPreviews.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                        >
                          <div className="flex items-center overflow-hidden">
                            <FileText size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm truncate max-w-xs">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                onClick={handlePreviousStep}
              >
                Back
              </button>
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
                      Creating a client without any loans
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You are about to create a client record without any loans.
                      Are you sure you want to proceed?
                    </p>
                    <div className="mt-3 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-3 py-1.5 text-sm bg-yellow-100 text-yellow-800 rounded border border-yellow-300 hover:bg-yellow-200 transition"
                      >
                        Proceed without loans
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNoLoanWarning(false)}
                        className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded border border-gray-300 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Loan Details</h3>
              <p className="text-sm text-blue-700">
                Add all loans for this client. You can add multiple loans with
                different terms.
              </p>
            </div>

            {/* Loan List */}
            {formData.loans.length > 0 ? (
              <div className="space-y-8">
                {formData.loans.map((loan, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveLoan(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      aria-label="Remove loan"
                    >
                      <X size={20} />
                    </button>

                    <h4 className="font-medium text-gray-700 mb-4">
                      Loan #{index + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Loan Amount */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={loan.loanAmount}
                          onChange={(e) =>
                            handleLoanChange(
                              index,
                              "loanAmount",
                              e.target.value
                            )
                          }
                          placeholder="Loan Amount"
                          className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>

                      {/* Interest Rate */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Percent size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={loan.interestRate}
                          onChange={(e) =>
                            handleLoanChange(
                              index,
                              "interestRate",
                              e.target.value
                            )
                          }
                          placeholder="Interest Rate (%)"
                          className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>

                      {/* EMI Type */}
                      <div>
                        <select
                          value={loan.emiType}
                          onChange={(e) =>
                            handleLoanChange(index, "emiType", e.target.value)
                          }
                          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Full Payment">Full Payment</option>
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={loan.startDate}
                          onChange={(e) =>
                            handleLoanChange(
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                          className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required
                        />
                      </div>

                      {/* Tenure Days */}
                      <div>
                        <input
                          type="number"
                          value={loan.tenureDays}
                          onChange={(e) =>
                            handleLoanChange(
                              index,
                              "tenureDays",
                              e.target.value
                            )
                          }
                          placeholder="Tenure (Days)"
                          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          required={
                            loan.emiType === "Daily" ||
                            loan.emiType === "Weekly" ||
                            loan.emiType === "Full Payment"
                          }
                        />
                      </div>

                      {/* Tenure Months (only for Monthly EMI) */}
                      {loan.emiType === "Monthly" && (
                        <div>
                          <input
                            type="number"
                            value={loan.tenureMonths}
                            onChange={(e) =>
                              handleLoanChange(
                                index,
                                "tenureMonths",
                                e.target.value
                              )
                            }
                            placeholder="Tenure (Months)"
                            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
                <div className="text-center text-gray-500">
                  <IndianRupee size={32} className="mx-auto mb-2" />
                  <p className="mb-4">No loans added yet</p>
                </div>
              </div>
            )}

            {/* Add Loan Button */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleAddLoan}
                className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
              >
                <Plus size={18} className="mr-1" />
                Add Loan
              </button>
            </div>

            <div className="flex justify-between pt-8">
              <button
                type="button"
                className="py-2 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                onClick={handlePreviousStep}
              >
                Back
              </button>

              <div className="flex gap-3">
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
                  className="flex items-center justify-center py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                  disabled={isSubmitting}
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-1" />
                      Save Client
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