import { useState, useEffect } from 'react';
import { X, Save, UserPlus, MapPin } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('clientFormData');
    return savedData ? JSON.parse(savedData) : {
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      email: '',
      loans: [
        {
          loanAmount: '',
          interestRate: '',
          tenureDays: '',
          tenureMonths: '',
          emiType: 'Monthly',
          startDate: new Date().toISOString().split('T')[0]
        }
      ]
    };
  });
  
  const [clientPhoto, setClientPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Save form data to local storage whenever it changes
    localStorage.setItem('clientFormData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLoanInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLoans = [...formData.loans];
    updatedLoans[index] = { ...updatedLoans[index], [name]: value };
    setFormData({ ...formData, loans: updatedLoans });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setClientPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const addNewLoan = () => {
    setFormData({
      ...formData,
      loans: [
        ...formData.loans,
        {
          loanAmount: '',
          interestRate: '',
          tenureDays: '',
          tenureMonths: '',
          emiType: 'Monthly',
          startDate: new Date().toISOString().split('T')[0]
        }
      ]
    });
  };

  const removeLoan = (index) => {
    if (formData.loans.length === 1) return;
    const updatedLoans = formData.loans.filter((_, i) => i !== index);
    setFormData({ ...formData, loans: updatedLoans });
  };

  const getLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Fetch address from coordinates using a reverse geocoding service
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          setLocation({
            latitude,
            longitude,
            address: data.display_name || 'Unknown location'
          });
        } catch (error) {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Location fetched (address unavailable)'
          });
        }
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request to get location timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        setLocationError(errorMessage);
      }
    );
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.clientName || !formData.clientPhone) {
      return false;
    }
    
    // Validate all loans
    for (const loan of formData.loans) {
      if (!loan.loanAmount || !loan.interestRate || 
          (!loan.tenureDays && !loan.tenureMonths) || !loan.emiType) {
        return false;
      }
    }
    
    return true;
  };

  const handleSave = () => {
    localStorage.setItem('clientFormData', JSON.stringify(formData));
    alert('Client data saved to local storage');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill all required fields');
      return;
    }

    if (!location) {
      alert('Please fetch your current location before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('clientName', formData.clientName);
      formDataToSend.append('clientPhone', formData.clientPhone);
      formDataToSend.append('clientAddress', formData.clientAddress);
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('loans', JSON.stringify(formData.loans));
      
      if (clientPhoto) {
        formDataToSend.append('clientPhoto', clientPhoto);
      }
      
      // Include location data
      formDataToSend.append('location', JSON.stringify(location));

      const token = localStorage.getItem('token');
      const response = await fetch('/api/agent/add-client', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const result = await response.json();
      alert('Client added successfully!');
      
      // Clear local storage after successful submission
      localStorage.removeItem('clientFormData');
      
      // Reset form
      setFormData({
        clientName: '',
        clientPhone: '',
        clientAddress: '',
        email: '',
        loans: [
          {
            loanAmount: '',
            interestRate: '',
            tenureDays: '',
            tenureMonths: '',
            emiType: 'Monthly',
            startDate: new Date().toISOString().split('T')[0]
          }
        ]
      });
      
      setClientPhoto(null);
      setPhotoPreview('');
      setLocation(null);
      
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Failed to add client: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Client</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Steps indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client Name*</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Photo</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16 border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          No photo
                        </div>
                      )}
                    </div>
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Loan Details</h3>
                
                {formData.loans.map((loan, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Loan #{index + 1}</h4>
                      {formData.loans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLoan(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Loan Amount*</label>
                        <input
                          type="number"
                          name="loanAmount"
                          value={loan.loanAmount}
                          onChange={(e) => handleLoanInputChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Interest Rate (%)*</label>
                        <input
                          type="number"
                          name="interestRate"
                          value={loan.interestRate}
                          onChange={(e) => handleLoanInputChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tenure (Days)</label>
                        <input
                          type="number"
                          name="tenureDays"
                          value={loan.tenureDays}
                          onChange={(e) => handleLoanInputChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tenure (Months)</label>
                        <input
                          type="number"
                          name="tenureMonths"
                          value={loan.tenureMonths}
                          onChange={(e) => handleLoanInputChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">EMI Type*</label>
                        <select
                          name="emiType"
                          value={loan.emiType}
                          onChange={(e) => handleLoanInputChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Full Payment">Full Payment</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date*</label>
                        <input
                          type="date"
                          name="startDate"
                          value={loan.startDate}
                          onChange={(e) => handleLoanInputChange(index, e)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addNewLoan}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  + Add Another Loan
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Location & Submit</h3>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-700 mb-2">
                    Please allow access to your current location to proceed with client registration.
                  </p>
                  
                  {!location ? (
                    <button
                      type="button"
                      onClick={getLocation}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                      disabled={isSubmitting}
                    >
                      <MapPin className="h-5 w-5" />
                      Get Current Location
                    </button>
                  ) : (
                    <div className="bg-white p-3 rounded-md border border-blue-200">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800">Location detected:</p>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {locationError && (
                    <p className="mt-2 text-sm text-red-600">{locationError}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-medium">Name:</span> {formData.clientName}</li>
                    <li><span className="font-medium">Phone:</span> {formData.clientPhone}</li>
                    <li><span className="font-medium">Number of Loans:</span> {formData.loans.length}</li>
                    <li>
                      <span className="font-medium">Total Loan Amount:</span> ₹
                      {formData.loans.reduce((total, loan) => total + (Number(loan.loanAmount) || 0), 0)}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-between border-t">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="bg-white text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md border border-gray-300"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
                disabled={isSubmitting || !location}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <UserPlus className="h-5 w-5" />
                )}
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}