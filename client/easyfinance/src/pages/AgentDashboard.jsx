import { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Eye, 
  Users, 
  Briefcase, 
  BarChart3, 
  Calendar,
  Activity,
  Loader2, LogOut
} from 'lucide-react';
import AgentAddClientForm from '../components/forms/AgentClientRegForm';
import AgentGetLoan from '../components/details/AgentGetLoan';
import AgentEmiCollection from '../components/details/AgentCollectEmi';
import { getAllAgentClients, addClient, logout } from '../services/agentAPI';

import RecentActivity from "../pages/AgentRecentActivity";

export default function AgentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalLoans: 0,
    activeLoans: 0,
    completedLoans: 0
  });
  
  const storedAgent = localStorage.getItem("agent");
  const agentId = storedAgent ? JSON.parse(storedAgent)?._id : null;

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAgentClients();
      if (data.success) {
        const clientsData = data.data || [];
        setClients(clientsData);
        setFilteredClients([]);
        
        // Calculate dashboard stats
        const totalLoans = clientsData.reduce((sum, client) => sum + (client.loans?.length || 0), 0);
        const activeLoans = clientsData.reduce((sum, client) => {
          return sum + (client.loans?.filter(loan => loan.status === 'Active' || loan.status === 'Pending')?.length || 0);
        }, 0);
        const completedLoans = clientsData.reduce((sum, client) => {
          return sum + (client.loans?.filter(loan => loan.status === 'Completed')?.length || 0);
        }, 0);
        
        setStats({
          totalClients: clientsData.length,
          totalLoans,
          activeLoans,
          completedLoans
        });
      } else {
        console.error("Failed to load clients:", data.message);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredClients([]);
      return;
    }

    const filtered = clients.filter(client =>
      client.clientName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleLogout = async () => {
      setIsLoggingOut(true);
      try {
        const response = await logout();
        if (response.success) {
          // Redirect to login page after successful logout
          window.location.href = '/login';
        } else {
          console.error("Logout failed:", response.message);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        setIsLoggingOut(false);
      }
    };

  const handleViewClient = (client) => {
    setSelectedClient(client);
  };

  const handleCollectEmi = (loan) => {
    setSelectedLoan(loan);
  };

  const handleBackToLoans = () => {
    setSelectedLoan(null);
  };
   
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Agent Dashboard</h1>
            <div className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            {isLoggingOut ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">Logout</span>
          </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
         {/* Recent Activity Section */}
         <RecentActivity agentId={agentId} />
        {/* Client Search Section */}
        <div className="bg-white rounded-lg shadow-md mt-2 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full sm:w-2/3">
              <label htmlFor="client-search" className="block text-sm font-medium text-gray-700 mb-1">Search Clients</label>
              <div className="relative">
                <input
                  id="client-search"
                  type="text"
                  placeholder="Search client by name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {filteredClients.length === 0 && searchTerm.trim() === '' && (
                <p className="mt-2 text-sm text-gray-500">
                  Start typing a client name to search.
                </p>
              )}
            </div>

            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200 shadow-sm"
            >
              <UserPlus className="h-5 w-5" />
              Add Client
            </button>
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              </div>
            ) : filteredClients.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Loans</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.clientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.clientPhoneNumbers?.[0]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.houseAddress || client.permanentAddress || client.shopAddress || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {client.loans?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                          >
                            <Eye className="h-4 w-4" />
                            View Loans
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              searchTerm.trim() && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 font-medium">No clients found with the name "{searchTerm}"</p>
                  <p className="text-gray-400 text-sm mt-1">Try a different search term or add a new client</p>
                </div>
              )
            )}
          </div>
        </div>
        
       
      </main>
      
      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <AgentAddClientForm
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          onSubmit={addClient}
          onClientAdded={fetchClients}
        />
      )}

      {/* View Loans */}
      {selectedClient && !selectedLoan && (
        <AgentGetLoan
          clientId={selectedClient._id}
          onBack={() => setSelectedClient(null)}
          onCollectEmi={handleCollectEmi}
        />
      )}

      {/* EMI Collection */}
      {selectedLoan && (
        <AgentEmiCollection
          clientId={selectedClient._id}
          loanId={selectedLoan._id}
          onClose={handleBackToLoans}
        />
      )}
    </div>
  );
}