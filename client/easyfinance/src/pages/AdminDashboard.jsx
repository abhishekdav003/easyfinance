import { useState, useEffect } from "react";
import { LogOut, Users, Loader, AlertTriangle, Search, Trash2, UserPlus, Upload } from "lucide-react";
import axios from "axios";

// Create an axios instance with baseURL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Agent APIs
const registerAgent = (data) => API.post("/admin/addagent", data);

// Get all agents with JWT token in the Authorization header
const getAllAgents = async () => {
  try {
    const response = await API.get("/admin/allagents", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw error;
  }
};

// Delete agent by ID
const deleteAgent = (id) => API.delete(`/admin/deleteagent/${id}`);

// Agent Register Form Component
const AgentRegisterForm = ({ onAgentAdded }) => {
  const [formData, setFormData] = useState({
    agentusername: "",
    fullname: "",
    email: "",
    fathername: "",
    password: "",
    photo: "" // This would be a URL in your case
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call your actual API function to register an agent
      await registerAgent(formData);
      
      // Clear form
      setFormData({
        agentusername: "",
        fullname: "",
        email: "",
        fathername: "",
        password: "",
        photo: ""
      });
      
      alert("Agent registered successfully!");
      
      // Refresh agent list
      if (onAgentAdded) onAgentAdded();
    } catch (error) {
      console.error("Error registering agent:", error);
      alert(`Failed to register agent: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6 mb-8">
      <div className="flex items-center mb-4">
        <UserPlus size={20} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-medium">Register New Agent</h3>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
            <input 
              type="text"
              name="agentusername"
              value={formData.agentusername}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agent Username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Father's Name</label>
            <input 
              type="text"
              name="fathername"
              value={formData.fathername}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Father's Name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input 
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Photo URL</label>
            <input 
              type="text"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Photo URL (optional)"
            />
          </div>
        </div>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="mt-6 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus size={16} className="mr-2" />
              Register Agent
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Main Dashboard Component
export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to fetch all agents from your API
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await getAllAgents();
      
      // Set the agents from the actual API response
      setAgents(response.data);
      console.log('agents loaded:', response.data);
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

  // Function to delete an agent
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id);
        alert("Agent deleted successfully!");
        
        // Optimistically update the state by removing the deleted agent
        setAgents(agents.filter(agent => agent._id !== id));
      } catch (err) {
        alert("Failed to delete agent.");
        console.error("Error deleting agent:", err);
      }
    }
  };

  const handleLogout = () => {
    // Implement your logout logic here
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    agent.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.agentusername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">FinanceHub</h1>
            <span className="ml-2 text-sm bg-blue-700 px-2 py-1 rounded">Admin</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded flex items-center transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto p-6 flex-grow">
        {/* Main Content */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Users size={24} className="text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Agent Management</h2>
            </div>
            
            {/* Agent Register Form */}
            <AgentRegisterForm onAgentAdded={fetchAgents} />
          </div>

          {/* Agent List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Users size={20} className="text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Agent Directory</h2>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {agents.length} Agents
                </span>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader size={24} className="animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading agents...</span>
              </div>
            ) : (
              <>
                {filteredAgents.length === 0 ? (
                  <div className="bg-gray-50 rounded-md p-10 text-center">
                    <AlertTriangle size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No agents found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">Username</th>
                          <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">Full Name</th>
                          <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">Email</th>
                          <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">Father's Name</th>
                          <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAgents.map((agent) => (
                          <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 border-b border-gray-200">
                              <div className="flex items-center">
                                {agent.photo ? (
                                  <img 
                                    src={agent.photo} 
                                    alt={agent.fullname} 
                                    className="w-8 h-8 rounded-full mr-3 object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                                    {agent.fullname?.charAt(0)?.toUpperCase() || 'A'}
                                  </div>
                                )}
                                {agent.agentusername}
                              </div>
                            </td>
                            <td className="px-6 py-4 border-b border-gray-200">{agent.fullname}</td>
                            <td className="px-6 py-4 border-b border-gray-200 text-gray-600">{agent.email}</td>
                            <td className="px-6 py-4 border-b border-gray-200 text-gray-600">{agent.fathername}</td>
                            <td className="px-6 py-4 border-b border-gray-200">
                              <button
                                onClick={() => handleDelete(agent._id)}
                                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={16} className="mr-1" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">© 2025 FinanceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}