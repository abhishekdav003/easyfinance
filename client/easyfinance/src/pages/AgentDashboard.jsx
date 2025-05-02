// import { useState, useEffect } from 'react';
// import { getAllClients } from '../services/agentAPI';

// // Import this way to make the artifact work
// const LoadingSpinner = () => {
//   return (
//     <div className="text-center py-12">
//       <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
//       <p className="mt-3 text-gray-600 font-medium">Loading clients...</p>
//     </div>
//   );
// };

// const StatCard = ({ title, value, icon, bgColor = "bg-blue-100", textColor = "text-blue-600" }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 flex items-center transition-all hover:shadow-md">
//       <div className={`rounded-full ${bgColor} p-3 mr-4`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-gray-500 text-sm font-medium">{title}</p>
//         <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
//       </div>
//     </div>
//   );
// };

// const ClientCard = ({ client }) => {
//   const activeLoans = client.loans?.filter(loan => loan.status === 'active') || [];
//   const latestEmi = client.loans?.[0]?.emiRecords?.[0]?.date 
//     ? new Date(client.loans[0].emiRecords[0].date).toLocaleDateString() 
//     : 'N/A';

//   return (
//     <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-100">
//       <div className="flex items-center mb-4">
//         <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
//           <span className="text-blue-600 font-bold text-lg">
//             {client.clientName.charAt(0).toUpperCase()}
//           </span>
//         </div>
//         <div>
//           <h3 className="font-semibold text-gray-800">{client.clientName}</h3>
//           <p className="text-sm text-gray-500">{client.phone}</p>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-2 gap-2 mb-4">
//         <div className="bg-gray-50 p-2 rounded-lg">
//           <p className="text-xs text-gray-500">Loans</p>
//           <p className="font-medium">
//             <span className="text-green-600">{activeLoans.length} active</span> / {client.loans?.length || 0} total
//           </p>
//         </div>
//         <div className="bg-gray-50 p-2 rounded-lg">
//           <p className="text-xs text-gray-500">Latest EMI</p>
//           <p className="font-medium">{latestEmi}</p>
//         </div>
//       </div>
      
//       <div className="flex space-x-2 pt-2 border-t border-gray-100">
//         <a 
//           href={`/client/${client._id}`} 
//           className="flex-1 text-center text-blue-600 bg-blue-50 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
//         >
//           Details
//         </a>
//         {activeLoans.length > 0 && (
//           <a 
//             href={`/collect-emi/${client._id}/${activeLoans[0]._id}`} 
//             className="flex-1 text-center text-green-600 bg-green-50 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
//           >
//             Collect EMI
//           </a>
//         )}
//       </div>
//     </div>
//   );
// };

// function AgentDashboard({ onLogout }) {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAddClientModal, setShowAddClientModal] = useState(false);
//   const [stats, setStats] = useState({
//     totalClients: 0,
//     activeLoans: 0,
//     totalCollection: 0
//   });

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   const fetchClients = async () => {
//     try {
//       setLoading(true);
//       const response = await getAllClients();
//       if (response.success) {
//         setClients(response.data);
//         calculateStats(response.data);
//       }
//     } catch (err) {
//       setError('Failed to load clients. Please try again.');
//       console.error('Error fetching clients:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = (clientData) => {
//     const totalClients = clientData.length;
//     let activeLoans = 0;
//     let totalCollection = 0;

//     clientData.forEach(client => {
//       if (client.loans && client.loans.length) {
//         client.loans.forEach(loan => {
//           if (loan.status === 'active') activeLoans++;
//           totalCollection += (loan.totalCollected || 0);
//         });
//       }
//     });

//     setStats({ totalClients, activeLoans, totalCollection });
//   };

//   const handleAddClientSuccess = () => {
//     setShowAddClientModal(false);
//     fetchClients();
//   };

//   const filteredClients = clients.filter(client => 
//     client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     client.phone.includes(searchTerm)
//   );

//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
//       {/* Sidebar component is imported externally */}
//       <div className="w-full lg:w-64 bg-white shadow-md lg:min-h-screen p-4">
//         {/* This is a placeholder - actual Sidebar component will be used */}
//         <div className="text-xl font-bold text-blue-600 mb-8">LoanTracker</div>
//         <nav>
//           <a href="/dashboard" className="flex items-center p-3 mb-2 bg-blue-50 text-blue-600 rounded-lg">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
//             </svg>
//             Dashboard
//           </a>
//           <a href="/clients" className="flex items-center p-3 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
//             </svg>
//             Clients
//           </a>
//           <a href="/loans" className="flex items-center p-3 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
//               <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
//             </svg>
//             Loans
//           </a>
//           <button 
//             onClick={onLogout} 
//             className="w-full flex items-center p-3 mb-2 text-red-600 hover:bg-red-50 rounded-lg"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L15.586 9H7a1 1 0 100 2h8.586l-1.293 1.293z" clipRule="evenodd" />
//             </svg>
//             Logout
//           </button>
//         </nav>
//       </div>
      
//       <div className="flex-1 overflow-auto">
//         <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Agent Dashboard</h1>
//             <button 
//               onClick={() => setShowAddClientModal(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//               </svg>
//               Add Client
//             </button>
//           </div>

//           {/* Stats Section */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <StatCard 
//               title="Total Clients"
//               value={stats.totalClients}
//               icon={
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               }
//               bgColor="bg-blue-100"
//               textColor="text-blue-600"
//             />

//             <StatCard 
//               title="Active Loans"
//               value={stats.activeLoans}
//               icon={
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               }
//               bgColor="bg-green-100"
//               textColor="text-green-600"
//             />

//             <StatCard 
//               title="Total Collection"
//               value={`₹${stats.totalCollection.toLocaleString()}`}
//               icon={
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               }
//               bgColor="bg-purple-100"
//               textColor="text-purple-600"
//             />
//           </div>

//           {/* Client Management Section */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
//             <div className="p-4 border-b border-gray-200">
//               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-3 sm:mb-0">Client Management</h2>
//                 <div className="w-full sm:w-auto">
//                   <div className="relative">
//                     <input
//                       type="text"
//                       placeholder="Search clients..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full sm:w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <svg
//                       className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {loading ? (
//               <LoadingSpinner />
//             ) : error ? (
//               <div className="text-center py-12">
//                 <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block mb-4">
//                   <p>{error}</p>
//                 </div>
//                 <button 
//                   onClick={fetchClients} 
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             ) : filteredClients.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="bg-blue-50 text-blue-700 p-4 rounded-lg inline-block">
//                   <p className="text-gray-600">
//                     {searchTerm ? "No clients match your search." : "No clients found. Add a new client to get started."}
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 {/* Mobile view - cards */}
//                 <div className="md:hidden p-4 space-y-4">
//                   {filteredClients.map((client) => (
//                     <ClientCard 
//                       key={client._id} 
//                       client={client} 
//                     />
//                   ))}
//                 </div>

//                 {/* Desktop view - table */}
//                 <div className="hidden md:block overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loans</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latest EMI</th>
//                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredClients.map((client) => {
//                         const activeLoans = client.loans?.filter(loan => loan.status === 'active') || [];
//                         const latestEmi = client.loans?.[0]?.emiRecords?.[0]?.date 
//                           ? new Date(client.loans[0].emiRecords[0].date).toLocaleDateString() 
//                           : 'N/A';
                        
//                         return (
//                           <tr key={client._id} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                                   <span className="text-blue-600 font-medium">{client.clientName.charAt(0).toUpperCase()}</span>
//                                 </div>
//                                 <div className="ml-4">
//                                   <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
//                                   <div className="text-sm text-gray-500">{client.address}</div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm text-gray-900">{client.phone}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex items-center">
//                                 <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
//                                 <div>
//                                   <div className="text-sm text-gray-900">{activeLoans.length} active</div>
//                                   <div className="text-sm text-gray-500">{client.loans?.length || 0} total</div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <span className="text-sm text-gray-500 bg-gray-100 py-1 px-2 rounded-full">{latestEmi}</span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                               <div className="flex space-x-2">
//                                 <a 
//                                   href={`/client/${client._id}`} 
//                                   className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full transition-colors"
//                                 >
//                                   Details
//                                 </a>
//                                 {activeLoans.length > 0 && (
//                                   <a 
//                                     href={`/collect-emi/${client._id}/${activeLoans[0]._id}`} 
//                                     className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-full transition-colors"
//                                   >
//                                     Collect EMI
//                                   </a>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* This is placeholder for AddClientModal component */}
//       {showAddClientModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">Add New Client</h2>
//               <button onClick={() => setShowAddClientModal(false)} className="text-gray-500 hover:text-gray-700">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//             <p className="text-center text-gray-600 my-4">This is a placeholder for AddClientModal component</p>
//             <div className="flex justify-end mt-6">
//               <button 
//                 onClick={() => setShowAddClientModal(false)}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleAddClientSuccess}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//               >
//                 Add Client
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AgentDashboard;








































import { useState, useEffect } from 'react';
import { getAllClients, getClientDetails, collectEmi, logoutAgent } from '../services/agentAPI';

// Loading Spinner Component
const LoadingSpinner = () => {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      <p className="mt-3 text-gray-600 font-medium">Loading...</p>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, bgColor = "bg-blue-100", textColor = "text-blue-600" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center transition-all hover:shadow-md">
      <div className={`rounded-full ${bgColor} p-3 mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
};

// Client Card Component
const ClientCard = ({ client, onViewDetails, onCollectEmi }) => {
  const activeLoans = client.loans?.filter(loan => loan.status === 'active') || [];
  const latestEmi = client.loans?.[0]?.emiRecords?.[0]?.date 
    ? new Date(client.loans[0].emiRecords[0].date).toLocaleDateString() 
    : 'N/A';

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <span className="text-blue-600 font-bold text-lg">
            {client.clientName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{client.clientName}</h3>
          <p className="text-sm text-gray-500">{client.phone}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-xs text-gray-500">Loans</p>
          <p className="font-medium">
            <span className="text-green-600">{activeLoans.length} active</span> / {client.loans?.length || 0} total
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">
          <p className="text-xs text-gray-500">Latest EMI</p>
          <p className="font-medium">{latestEmi}</p>
        </div>
      </div>
      
      <div className="flex space-x-2 pt-2 border-t border-gray-100">
        <button 
          onClick={() => onViewDetails(client._id)}
          className="flex-1 text-center text-blue-600 bg-blue-50 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          Details
        </button>
        {activeLoans.length > 0 && (
          <button 
            onClick={() => onCollectEmi(client._id, activeLoans[0]._id)}
            className="flex-1 text-center text-green-600 bg-green-50 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            Collect EMI
          </button>
        )}
      </div>
    </div>
  );
};

// Add Client Component
const AddClientModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    address: '',
    aadharNumber: '',
    panNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Mock API call - replace with actual API when ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess();
    } catch (err) {
      setError('Failed to add client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name*</label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-400"
            >
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Collect EMI Modal Component
const CollectEmiModal = ({ clientId, loanId, onClose, onSuccess }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amountCollected: 0,
    status: 'Paid',
    location: {
      type: 'Point',
      coordinates: [0, 0]
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await getClientDetails(clientId);
        setClientData(response.data);
        
        // Find the specific loan
        const loan = response.data.loans.find(loan => loan._id === loanId);
        if (loan) {
          setFormData({
            ...formData,
            amountCollected: loan.emiAmount || 0
          });
        }
      } catch (err) {
        setError('Failed to load client details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              type: 'Point',
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }));
        },
        (err) => {
          console.error("Error getting location:", err);
          // Set a default location
          setFormData(prev => ({
            ...prev,
            location: {
              type: 'Point',
              coordinates: [77.2090, 28.6139] // Default to Delhi
            }
          }));
        }
      );
    }
  }, [clientId, loanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amountCollected') {
      setFormData({
        ...formData,
        amountCollected: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await collectEmi(clientId, loanId, formData);
      onSuccess();
    } catch (err) {
      setSubmitError(err.message || 'Failed to collect EMI. Please try again.');
      console.error('Error collecting EMI:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <LoadingSpinner />
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Error</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Find the specific loan
  const loan = clientData?.loans?.find(loan => loan._id === loanId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Collect EMI</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Client:</span>
            <span className="font-medium">{clientData?.clientName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Loan Amount:</span>
            <span className="font-medium">₹{loan?.loanAmount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">EMI Amount:</span>
            <span className="font-medium">₹{loan?.emiAmount?.toLocaleString() || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium">₹{loan?.totalAmountLeft?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
        
        {submitError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Collected*</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                <input
                  type="number"
                  name="amountCollected"
                  value={formData.amountCollected}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Paid">Paid</option>
                <option value="Defaulted">Defaulted</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                <p>Coordinates: {formData.location.coordinates[1]}, {formData.location.coordinates[0]}</p>
                <p className="text-gray-500 mt-1">Location is captured automatically</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-400"
            >
              {isSubmitting ? 'Processing...' : 'Collect EMI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Client Details Component
const ClientDetails = ({ clientId, onBack }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCollectEmiModal, setShowCollectEmiModal] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await getClientDetails(clientId);
        setClientData(response.data);
      } catch (err) {
        setError('Failed to load client details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleEmiCollectionSuccess = () => {
    setShowCollectEmiModal(false);
    // Refresh client data
    const fetchUpdatedClientDetails = async () => {
      try {
        setLoading(true);
        const response = await getClientDetails(clientId);
        setClientData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdatedClientDetails();
  };

  const handleCollectEmi = (loanId) => {
    setSelectedLoanId(loanId);
    setShowCollectEmiModal(true);
  };

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div className="text-center py-12">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block mb-4">
        <p>{error}</p>
      </div>
      <button 
        onClick={onBack} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Client Details</h1>
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-2xl">
                {clientData.clientName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{clientData.clientName}</h2>
              <div className="flex mt-1 text-gray-600">
                <div className="flex items-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {clientData.phone}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {clientData.address || 'No address provided'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Aadhar Number</p>
              <p className="font-medium">{clientData.aadharNumber || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">PAN Number</p>
              <p className="font-medium">{clientData.panNumber || 'N/A'}</p>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-4">Loans</h3>
          
          {clientData.loans && clientData.loans.length > 0 ? (
            <div className="space-y-4">
              {clientData.loans.map((loan) => (
                <div key={loan._id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className={`px-4 py-3 flex justify-between items-center ${loan.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${loan.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className={`font-medium ${loan.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)} Loan
                      </span>
                    </div>
                    <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                      ₹{loan.loanAmount?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">EMI Amount</p>
                        <p className="font-medium">₹{loan.emiAmount?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">EMI Type</p>
                        <p className="font-medium">{loan.emiType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Payable</p>
                        <p className="font-medium">₹{loan.totalPayable?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount Left</p>
                        <p className="font-medium">₹{loan.totalAmountLeft?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">EMIs Paid</p>
                        <p className="font-medium">{loan.paidEmis || 0} / {loan.totalEmis || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next EMI Date</p>
                        <p className="font-medium">
                          {loan.nextEmiDate ? new Date(loan.nextEmiDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {loan.status === 'active' && (
                      <button
                        onClick={() => handleCollectEmi(loan._id)}
                        className="w-full py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                      >
                        Collect EMI
                      </button>
                    )}
                  </div>
                  
                  {loan.emiRecords && loan.emiRecords.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-3">
                      <p className="font-medium text-sm mb-2">Recent EMI Records</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {loan.emiRecords.slice(0, 5).map((record, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                            <span className={record.status === 'Paid' ? 'text-green-600' : 'text-red-600'}>
                              ₹{record.amountCollected?.toLocaleString()}
                              {record.status === 'Defaulted' && ' (Defaulted)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No loans found for this client.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* EMI Collection Modal */}
      {showCollectEmiModal && (
        <CollectEmiModal 
          clientId={clientId} 
          loanId={selectedLoanId}
          onClose={() => setShowCollectEmiModal(false)}
          onSuccess={handleEmiCollectionSuccess}
        />
      )}
    </div>
  );
};

// Main Dashboard Component
const AgentDashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showCollectEmiModal, setShowCollectEmiModal] = useState(false);
  const [selectedClientForEmi, setSelectedClientForEmi] = useState(null);
  const [selectedLoanForEmi, setSelectedLoanForEmi] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statsData, setStatsData] = useState({
    totalClients: 0,
    activeLoans: 0,
    totalCollectedToday: 0,
    defaultedEmis: 0
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      setClients(response.data);
      
      // Calculate stats
      let activeLoans = 0;
      let totalCollectedToday = 0;
      let defaultedEmis = 0;
      
      const today = new Date();
      
      response.data.forEach(client => {
        client.loans?.forEach(loan => {
          if (loan.status === 'active') {
            activeLoans++;
          }
          
          loan.emiRecords?.forEach(record => {
            const recordDate = new Date(record.date);
            if (recordDate.toDateString() === today.toDateString()) {
              totalCollectedToday += record.amountCollected || 0;
            }
            
            if (record.status === 'Defaulted') {
              defaultedEmis++;
            }
          });
        });
      });
      
      setStatsData({
        totalClients: response.data.length,
        activeLoans,
        totalCollectedToday,
        defaultedEmis
      });
    } catch (err) {
      setError(err.message || 'Failed to load clients. Please try again.');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredClients = clients.filter(client => 
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.phone.includes(searchQuery)
  );

  const handleViewDetails = async (clientId) => {
    setSelectedClient(clientId);
    setCurrentView('clientDetails');
  };

  const handleCollectEmi = (clientId, loanId) => {
    setSelectedClientForEmi(clientId);
    setSelectedLoanForEmi(loanId);
    setShowCollectEmiModal(true);
  };

  const handleAddClientSuccess = () => {
    setShowAddClientModal(false);
    fetchClients();
  };

  const handleEmiCollectionSuccess = () => {
    setShowCollectEmiModal(false);
    fetchClients();
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedClient(null);
  };

  const handleLogout = async () => {
    try {
      await logoutAgent();
      localStorage.removeItem('agentToken'); // or sessionStorage if you used it
      window.location.href = '/login'; // navigate to login page
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div className="text-center py-12">
      <div className="bg-red-100 text-red-700 p-4 rounded-lg inline-block mb-4">
        <p>{error}</p>
      </div>
      <button 
        onClick={fetchClients} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Try Again
      </button>
    </div>
  );

  if (currentView === 'clientDetails' && selectedClient) {
    return <ClientDetails clientId={selectedClient} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Agent Dashboard</h1>
          <p className="text-gray-600">Manage clients and collect EMIs</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowAddClientModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Client
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Clients" 
          value={statsData.totalClients} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Active Loans" 
          value={statsData.activeLoans} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard 
          title="Collected Today" 
          value={`₹${statsData.totalCollectedToday.toLocaleString()}`} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Defaulted EMIs" 
          value={statsData.defaultedEmis} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clients by name or phone..."
            value={searchQuery}
            onChange={handleClientSearch}
            className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Clients</h2>
        
        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <ClientCard 
                key={client._id} 
                client={client} 
                onViewDetails={handleViewDetails}
                onCollectEmi={handleCollectEmi}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            {searchQuery ? (
              <p className="text-gray-600">No clients match your search.</p>
            ) : (
              <p className="text-gray-600">No clients found. Add your first client to get started.</p>
            )}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClientModal && (
        <AddClientModal 
          onClose={() => setShowAddClientModal(false)}
          onSuccess={handleAddClientSuccess}
        />
      )}

      {/* Collect EMI Modal */}
      {showCollectEmiModal && (
        <CollectEmiModal 
          clientId={selectedClientForEmi} 
          loanId={selectedLoanForEmi}
          onClose={() => setShowCollectEmiModal(false)}
          onSuccess={handleEmiCollectionSuccess}
        />
      )}
    </div>
  );
};

export default AgentDashboard;