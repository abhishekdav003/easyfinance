import { useState } from 'react';
import { X, Calendar, DollarSign, Clock, User, Phone, MapPin, Mail } from 'lucide-react';

export default function ViewClientModal({ isOpen, onClose, client, onCollectEmi }) {
  const [activeTab, setActiveTab] = useState('loans');

  if (!isOpen || !client) return null;

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Client Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Client Info Header */}
          <div className="bg-blue-50 p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {client.photoUrl ? (
                  <img src={client.photoUrl} alt={client.clientName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{client.clientName}</h3>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.clientPhone}
                  </div>
                  {client.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                  {client.clientAddress && (
                    <div className="flex items-start text-gray-600 col-span-1 sm:col-span-2">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{client.clientAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('loans')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'loans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Loans
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'loans' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Loans</h3>
                
                {client.loans && client.loans.length > 0 ? (
                  <div className="space-y-6">
                    {client.loans.map((loan, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                              <span className="font-medium text-gray-900">
                                Loan #{loan.uniqueLoanNumber ? loan.uniqueLoanNumber.slice(-4) : index + 1}
                              </span>
                            </div>
                            <div className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                              {loan.status || 'Active'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Loan Amount</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ₹{Number(loan.loanAmount).toLocaleString('en-IN')}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">Interest Rate</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {loan.interestRate}%
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">EMI Amount</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ₹{Number(loan.emiAmount || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500">EMI Type</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {loan.emiType}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Start Date</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(loan.startDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Tenure</p>
                                <p className="font-medium text-gray-900">
                                  {loan.tenureMonths ? `${loan.tenureMonths} Months` : ''}
                                  {loan.tenureMonths && loan.tenureDays ? ' and ' : ''}
                                  {loan.tenureDays ? `${loan.tenureDays} Days` : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <button
                              onClick={() => onCollectEmi(client, loan)}
                              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
                            >
                              <DollarSign className="h-5 w-5" />
                              Collect EMI
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No active loans found for this client
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'payments' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
                
                {client.payments && client.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loan #
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mode
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {client.payments.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(payment.paymentDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.loanId ? payment.loanId.slice(-4) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₹{Number(payment.paymentAmount).toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.paymentMode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'Failed' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {payment.status || 'Completed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No payment history found for this client
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}