import { useEffect, useState } from "react";
import AgentRegisterForm from "../components/forms/AgentRegisterForm";
import { getAllAgents, deleteAgent } from "../services/api";

export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all agents from the backend
  const fetchAgents = async () => {
    try {
      setLoading(true); // Set loading state before fetching
      const res = await getAllAgents();
      
    
      setAgents(res.data); 
      console.log('res', res);
      
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      alert(`Error fetching agents: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false); // Set loading to false after the fetch completes
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle agent deletion
  const handleDelete = async (id) => {
    try {
      await deleteAgent(id); // Call deleteAgent API to delete the agent
      alert("Agent deleted successfully!");
      
      // Optimistically update the state by removing the deleted agent
      setAgents(agents.filter(agent => agent._id !== id));
    } catch (err) {
      alert("Failed to delete agent.");
      console.error("Error deleting agent:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-10">
        <h1 className="text-2xl font-bold mb-5">Admin Dashboard</h1>

        <AgentRegisterForm onAgentAdded={fetchAgents} /> {/* Refresh agents on new agent addition */}

        <hr className="my-10" />

        <h2 className="text-xl font-semibold mb-4">List of Agents</h2>
        
        {loading ? (
          <p>Loading...</p> // Show loading indicator while fetching data
        ) : (
          <table className="w-full bg-white shadow-md rounded">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Phone</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4">
                    No agents found.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent._id} className="border-t">
                    <td className="px-4 py-2">{agent.name}</td>
                    <td className="px-4 py-2">{agent.email}</td>
                    <td className="px-4 py-2">{agent.phone}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(agent._id)} // Delete agent by _id
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
