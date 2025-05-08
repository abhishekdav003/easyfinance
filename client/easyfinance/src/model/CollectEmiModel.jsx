import { useState } from 'react';
import { X, CreditCard, Banknote, User, Calendar } from 'lucide-react';

export default function CollectEmiModal({ isOpen, onClose, client, loan }) {
  const [formData, setFormData] = useState({
    paymentAmount: loan?.emiAmount || '',
    paymentMode: 'Cash',
    receiverName: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !client || !loan) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      return false;
    }
    
    if (formData.paymentMode === 'Cash' && !formData.receiverName.trim()) {
      setError('Receiver name is required for cash payments');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agent/collect-emi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: client._id,
          loanId: loan._id || loan.uniqueLoanNumber,
          paymentAmount: parseFloat(formData.paymentAmount),
          paymentMode: formData.paymentMode,
          receiverName: formData.paymentMode === 'Cash' ? formData.receiverName : '',
          paymentDate: formData.paymentDate,
          notes: formData.notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      
      const result = await response.json();
      setSuccess('Payment collected successfully!');
      
      // Reset form
      setFormData({
        paymentAmount: loan?.emiAmount || '',
        paymentMode: 'Cash',
        receiverName: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error collecting EMI:', error);
      setError(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Collect EMI</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{client.clientName}</h3>
                <p className="text-sm text-gray-600">Loan #{loan.uniqueLoanNumber ? loan.uniqueLoanNumber.slice(-4) : 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Total Loan:</div>
              <div className="font-medium">₹{Number(loan.loanAmount).toLocaleString('en-IN')}</div>
              
              <div className="text-gray-500">EMI Amount:</div>
              <div className="font-medium">₹{Number(loan.emiAmount || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount*
              </label>
              <input
                type="number"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode*
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer ${
                  formData.paymentMode === 'Cash' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="Cash"
                    checked={formData.paymentMode === 'Cash'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Banknote className="h-5 w-5 text-blue-600" />
                  <span>Cash</span>
                </label>
                
                <label className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer ${
                  formData.paymentMode === 'Online' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="Online"
                    checked={formData.paymentMode === 'Online'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <span>Online</span>
                </label>
              </div>
            </div>
            
            {formData.paymentMode === 'Cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Name*
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required={formData.paymentMode === 'Cash'}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="2"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
              {success}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                'Collect Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}