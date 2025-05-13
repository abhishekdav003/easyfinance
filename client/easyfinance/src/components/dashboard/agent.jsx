// components/agents/AgentManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  User,
  AlertTriangle,
  Loader,
  Filter,
  X,
} from "lucide-react";
import { getAllAgents, deleteAgent } from "../../services/api";
import { useNavigate } from "react-router-dom";
import AgentRegisterForm from "../dashboard/agentregistration";
import AgentEmiCollectionModal from "../details/AgentCollection";

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await getAllAgents();
      setAgents(response.data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      alert(
        `Error fetching agents: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id);
        alert("Agent deleted successfully!");
        setAgents(agents.filter((agent) => agent._id !== id));
      } catch (err) {
        alert("Failed to delete agent.");
        console.error("Error deleting agent:", err);
      }
    }
  };

  ///////////////////////////////////////
  const openModal = (agentId) => {
    setSelectedAgentId(agentId);
    setModalOpen(true);
  };
  //////////////////////////////////////////

  // Filter agents based on search term
  const filteredAgents = agents.filter(
    (agent) =>
      agent.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentusername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchTerm("");
    }
  };

  return (
    <div className="p-2 md:p-6">
      {/* Agent Registration Form */}
      <div className="mb-8">
        <AgentRegisterForm onAgentAdded={fetchAgents} />
      </div>

      {/* Agent List */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center">
            <Users size={20} className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Agent Directory</h3>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {agents.length} Agents
            </span>
          </div>

          {/* Mobile search toggle button */}
          <div className="md:hidden w-full flex justify-end">
            <button
              onClick={toggleSearch}
              className="p-2 bg-blue-50 rounded-md"
            >
              {isSearchOpen ? (
                <X size={20} className="text-blue-600" />
              ) : (
                <Search size={20} className="text-blue-600" />
              )}
            </button>
          </div>

          {/* Search bar - mobile */}
          {isSearchOpen && (
            <div className="w-full md:hidden relative">
              <Search
                size={18}
                className="absolute left-3 top-2.5 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}

          {/* Search bar - desktop */}
          <div className="relative hidden md:block">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
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
                <AlertTriangle
                  size={32}
                  className="mx-auto mb-2 text-gray-400"
                />
                <p className="text-gray-500">No agents found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                {/* Desktop table view */}
                <table className="w-full table-auto hidden md:table">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">
                        Photo
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">
                        Username
                      </th>

                      <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">
                        Full Name
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">
                        Father's Name
                      </th>
                      <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr
                        key={agent._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 border-b border-gray-200">
  <img
    src={agent.photo}
    alt={agent.fullname}
    className="w-10 h-10 rounded-full object-cover"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = "https://via.placeholder.com/40";
    }}
  />
</td>
                        <td className="px-6 py-4 border-b border-gray-200">
                          {agent.agentusername}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200">
                          {agent.fullname}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200">
                          {agent.email}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200">
                          {agent.fathername}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAgentId(agent._id);
                                setModalOpen(true);
                              }}
                              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                              title="View EMI Collection"
                            >
                              <User size={16} className="text-blue-600" />
                            </button>

                            <button
                              onClick={() => handleDeleteAgent(agent._id)}
                              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                              title="Delete Agent"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <AgentEmiCollectionModal
                  agentId={selectedAgentId}
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                />

                {/* Mobile card view */}
                <div className="md:hidden space-y-4 px-4">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-blue-600">
                          {agent.agentusername}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedAgentId(agent._id);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                            title="Edit Agent"
                          >
                            <User size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent._id)}
                            className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete Agent"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Full Name:</span>
                          <span className="font-medium">{agent.fullname}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium">{agent.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Father's Name:</span>
                          <span className="font-medium">
                            {agent.fathername}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AgentManagement;
