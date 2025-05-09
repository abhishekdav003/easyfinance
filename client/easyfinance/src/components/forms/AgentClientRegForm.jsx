import { useState, useEffect } from "react";
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
  UserPlus,
  PlusCircle,
  MinusCircle,
  MapPinIcon,
} from "lucide-react";
import { addClient } from "../../services/agentAPI";
const AgentAddClientForm = ({ onClientAdded, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhoneNumbers: [""], // Array for multiple phone numbers
    referalName: "",
    referalNumber: "",
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
    location: {
      latitude: null,
      longitude: null,
    },
  });

  const [previewImages, setPreviewImages] = useState({
    clientPhoto: null,
    shopPhoto: null,
    housePhoto: null,
  });
  
  const [documentPreviews, setDocumentPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("clientInfo"); // "clientInfo", "addressInfo", "photoDocuments", or "loans"
  const [phoneErrors, setPhoneErrors] = useState([""]);
  const [nameError, setNameError] = useState("");
  const [showNoLoanWarning, setShowNoLoanWarning] = useState(false);
  const [apiError, setApiError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  // Get geolocation when component mounts
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLocationStatus("Fetching location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          setLocationStatus("Location captured successfully");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("Failed to get location. Please enable location access.");
        }
      );
    } else {
      setLocationStatus("Geolocation is not supported by this browser.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation errors
    if (name === "clientName") setNameError("");
    if (apiError) setApiError("");
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...formData.clientPhoneNumbers];
    updatedPhones[index] = value;
    
    setFormData((prev) => ({
      ...prev,
      clientPhoneNumbers: updatedPhones,
    }));

    // Clear validation errors for this phone
    const updatedErrors = [...phoneErrors];
    updatedErrors[index] = "";
    setPhoneErrors(updatedErrors);
  };

  const addPhoneNumber = () => {
    setFormData((prev) => ({
      ...prev,
      clientPhoneNumbers: [...prev.clientPhoneNumbers, ""],
    }));
    setPhoneErrors([...phoneErrors, ""]);
  };

  const removePhoneNumber = (index) => {
    if (formData.clientPhoneNumbers.length > 1) {
      const updatedPhones = [...formData.clientPhoneNumbers];
      updatedPhones.splice(index, 1);
      
      setFormData((prev) => ({
        ...prev,
        clientPhoneNumbers: updatedPhones,
      }));

      const updatedErrors = [...phoneErrors];
      updatedErrors.splice(index, 1);
      setPhoneErrors(updatedErrors);
    }
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

    // Phone validation for all phone numbers
    const phoneRegex = /^\d+$/;
    const newPhoneErrors = formData.clientPhoneNumbers.map(phone => {
      if (!phone) {
        return "Phone number is required";
      }
      if (!phoneRegex.test(phone)) {
        return "Phone number should contain only digits";
      }
      return "";
    });
    
    setPhoneErrors(newPhoneErrors);
    
    if (newPhoneErrors.some(error => error !== "")) {
      isValid = false;
    }

    // Check for at least one phone number
    if (formData.clientPhoneNumbers.length === 0 || !formData.clientPhoneNumbers[0]) {
      setPhoneErrors(["At least one phone number is required"]);
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
      
      // Add all phone numbers
      formData.clientPhoneNumbers.forEach((phone, index) => {
        formToSend.append(`clientPhoneNumbers[${index}]`, phone);
      });
      
      // Add referral information
      formToSend.append("referalName", formData.referalName);
      formToSend.append("referalNumber", formData.referalNumber);
      
      // Add email
      formToSend.append("email", formData.email);
      
      // Add location data
      if (formData.location.latitude && formData.location.longitude) {
        formToSend.append("latitude", formData.location.latitude);
        formToSend.append("longitude", formData.location.longitude);
      }
      
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
      const response = await addClient(formToSend);

      // Handle successful response
      alert("Client added successfully!");

      // Reset form
      setFormData({
        clientName: "",
        clientPhoneNumbers: [""],
        referalName: "",
        referalNumber: "",
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
        location: {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        },
      });
      setPreviewImages({
        clientPhoto: null,
        shopPhoto: null,
        housePhoto: null,
      });
      setDocumentPreviews([]);
      setPhoneErrors([""]);

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

      {/* Location status message */}
      {locationStatus && (
        <div className={`p-3 mb-4 ${locationStatus.includes("Failed") ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"} border rounded-lg`}>
          <div className="flex items-center">
            <MapPinIcon size={18} className="mr-2 text-gray-600" />
            <span className="text-gray-700">{locationStatus}</span>
            {locationStatus.includes("Failed") && (
              <button 
                type="button" 
                onClick={getLocation}
                className="ml-auto text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-3 rounded"
              >
                Try Again
              </button>
            )}
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

              {/* Multiple Phone Numbers */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Phone Numbers</h3>
                {formData.clientPhoneNumbers.map((phone, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={18} className="text-gray-400" />
                      </div>
                      <input
                        value={phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder={`Phone Number ${index + 1}`}
                        className={`pl-10 w-full py-3 px-4 border ${
                          phoneErrors[index] ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition`}
                        required={index === 0}
                      />
                    </div>
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={addPhoneNumber}
                        className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <PlusCircle size={24} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removePhoneNumber(index)}
                        className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                      >
                        <MinusCircle size={24} />
                      </button>
                    )}
                  </div>
                ))}
                {phoneErrors.map((error, index) => 
                  error ? (
                    <p key={index} className="mt-1 text-sm text-red-500">
                      {error}
                    </p>
                  ) : null
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

              {/* Referral Information */}
              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Referral Information</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus size={18} className="text-gray-400" />
                    </div>
                    <input
                      name="referalName"
                      value={formData.referalName}
                      onChange={handleChange}
                      placeholder="Referral Name"
                      className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      name="referalNumber"
                      value={formData.referalNumber}
                      onChange={handleChange}
                      placeholder="Referral Phone Number"
                      className="pl-10 w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
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
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Client Photo
                    </label>
                    <input
                      type="file"
                      id="clientPhoto"
                      onChange={(e) => handleFileChange(e, "clientPhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="clientPhoto"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Select Photo
                    </label>
                  </div>
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
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Shop Photo
                    </label>
                    <input
                      type="file"
                      id="shopPhoto"
                      onChange={(e) => handleFileChange(e, "shopPhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="shopPhoto"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Select Photo
                    </label>
                  </div>
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
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload House Photo
                    </label>
                    <input
                      type="file"
                      id="housePhoto"
                      onChange={(e) => handleFileChange(e, "housePhoto")}
                      accept="image/*"
                      className="hidden"
                    />
                    <label
                      htmlFor="housePhoto"
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <Upload size={16} className="mr-2" />
                      Select Photo
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="mt-6 space-y-4">
              <h3 className="font-medium text-gray-700">Documents</h3>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex flex-col items-center">
                  <FileText size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">
                    Upload client documents (ID, proof of address, etc.)
                  </p>
                  <input
                    type="file"
                    id="documents"
                    onChange={handleDocumentsChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    multiple
                    className="hidden"
                  />
                  <label
                    htmlFor="documents"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <Upload size={16} className="mr-2" />
                    Select Documents
                  </label>
                </div>
              </div>

              {/* Document Preview */}
              {documentPreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documentPreviews.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {doc.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            {/* Warning if no loans are present */}
            {showNoLoanWarning && (
              <div className="p-3 mb-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-center text-yellow-800">
                  <AlertTriangle size={18} className="mr-2" />
                  <span>No loans have been added. Do you want to submit the client without any loan details?</span>
                </div>
              </div>
            )}

            {/* Loans list */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Loan Details</h3>
                <button
                  type="button"
                  onClick={handleAddLoan}
                  className="flex items-center text-blue-600 hover:text-blue-800 py-1 px-3 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 transition"
                >
                  <Plus size={16} className="mr-1" />
                  Add Loan
                </button>
              </div>

              {formData.loans.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No loans added yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.loans.map((loan, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800">
                          Loan #{index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveLoan(index)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IndianRupee size={16} className="text-gray-400" />
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
                              className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="Amount"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Interest Rate (%)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Percent size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="number"
                              value={loan.interestRate}
                              onChange={(e) =>
                                handleLoanChange(
                                  index,
                                  "interestRate",
                                  e.target.value
                                )
                              }
                              className="pl-10 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="Interest Rate"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            EMI Type
                          </label>
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar size={16} className="text-gray-400" />
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
                        </div>

                        {(loan.emiType === "Daily" ||
                          loan.emiType === "Weekly" ||
                          loan.emiType === "Full Payment") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tenure (Days)
                            </label>
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
                              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                              placeholder="Days"
                              required
                            />
                          </div>
                        )}

                        {loan.emiType === "Monthly" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tenure (Months)
                              </label>
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
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Months"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                or Tenure (Days)
                              </label>
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
                                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                placeholder="Days"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                type="submit"
                className="flex items-center py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Client
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AgentAddClientForm;