import { useState, useEffect } from 'react';
import { Search, UserPlus, Eye } from 'lucide-react';
import AddClientModal from '../model/AddClientModel';
import CollectEmiModal from '../model/CollectEmiModel';
import ViewClientModal from '../model/ViewClientModel';
import { searchClients } from '../services/agentAPI';

export default function AgentDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false);
  const [isCollectEmiModalOpen, setIsCollectEmiModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Function to handle search
  const handleSearch = async (e) => {
  e.preventDefault();
  if (!searchTerm.trim()) return;

  setIsLoading(true);
  try {
    const data = await searchClients(searchTerm);
    if (data.success) {
      setSearchResults(data.data || []);
    } else {
      console.error("Search failed:", data.message);
      setSearchResults([]);
    }
  } catch (error) {
    console.error("Search error:", error);
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
};


  // Function to view client details
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setIsViewClientModalOpen(true);
  };

  // Function to collect EMI
  const handleCollectEmi = (client, loan) => {
    setSelectedClient(client);
    setSelectedLoan(loan);
    setIsCollectEmiModalOpen(true);
    setIsViewClientModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Search and Add Client Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="w-full sm:w-2/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search client by name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e);
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={handleSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-700"
                >
                  Search
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              <UserPlus className="h-5 w-5" />
              Add Client
            </button>
          </div>

          {/* Search Results */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((client) => (
                      <tr key={client._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {client.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.clientPhone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : searchTerm.trim() ? (
              <div className="text-center py-8 text-gray-500">
                No clients found with the name "{searchTerm}"
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Search for clients by name to view their details
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isAddClientModalOpen && (
        <AddClientModal 
          isOpen={isAddClientModalOpen} 
          onClose={() => setIsAddClientModalOpen(false)} 
        />
      )}

      {isViewClientModalOpen && selectedClient && (
        <ViewClientModal
          isOpen={isViewClientModalOpen}
          onClose={() => setIsViewClientModalOpen(false)}
          client={selectedClient}
          onCollectEmi={handleCollectEmi}
        />
      )}

      {isCollectEmiModalOpen && selectedClient && selectedLoan && (
        <CollectEmiModal
          isOpen={isCollectEmiModalOpen}
          onClose={() => setIsCollectEmiModalOpen(false)}
          client={selectedClient}
          loan={selectedLoan}
        />
      )}
    </div>
  );
}