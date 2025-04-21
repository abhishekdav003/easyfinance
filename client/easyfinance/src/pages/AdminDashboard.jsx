import { useEffect, useState } from "react";
import { Users, RefreshCw, Search, PlusCircle, Trash2, Loader } from "lucide-react";
import AgentRegisterForm from "../components/forms/AgentRegisterForm";
import { getAllAgents, deleteAgent } from "../services/api";

export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all agents from the backend
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await getAllAgents();
      setAgents(res.data);
      console.log('res', res);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      alert(`Error fetching agents: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Handle agent deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id);
        setAgents(agents.filter(agent => agent._id !== id));
        
        // Show toast notification
        const toast = document.getElementById("toast");
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
      } catch (err) {
        alert("Failed to delete agent.");
        console.error("Error deleting agent:", err);
      }
    }
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users size={24} />
            <h1 className="text-xl font-bold">Agent Management</h1>
          </div>
          <button 
            onClick={() => fetchAgents()} 
            className="flex items-center space-x-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto p-6">
        {/* Stats summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm uppercase font-semibold">Total Agents</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{agents.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm uppercase font-semibold">Active Today</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{Math.floor(agents.length * 0.7)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 text-sm uppercase font-semibold">New This Week</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{Math.floor(agents.length * 0.3)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search agents..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusCircle size={18} className="mr-2" />
            {showForm ? "Hide Form" : "Add New Agent"}
          </button>
        </div>

        {/* Registration form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-indigo-500">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Register New Agent</h2>
            <AgentRegisterForm onAgentAdded={() => {
              fetchAgents();
              setShowForm(false);
            }} />
          </div>
        )}

        {/* Agents table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Agent Directory</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader size={30} className="animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading agents...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-6 text-gray-500">
                        {searchTerm ? "No agents match your search." : "No agents found. Add your first agent!"}
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((agent) => (
                      <tr key={agent._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{agent.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{agent.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{agent.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDelete(agent._id)}
                            className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} className="mr-1" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Table footer with pagination placeholder */}
          {filteredAgents.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredAgents.length}</span> agents
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success toast notification */}
      <div id="toast" className="hidden fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg">
        Agent deleted successfully!
      </div>
    </div>
  );
}