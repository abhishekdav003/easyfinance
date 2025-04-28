import React, { useState, useEffect } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  UserPlus,
  UserMinus,
  CreditCard,
  Wallet,
  IndianRupee,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LogOut,
  Search,
  Trash2,
  User,
  AlertTriangle,
  Loader,
} from "lucide-react";
import {
  getAllAgents,
  deleteAgent,
  registerAgent,
  getAllClients,
  getAdminDashboardAnalyticsData,
  getClientDetailsById,
  deleteClient,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import AddClientForm from "../components/forms/ClientRegistration";
import axios from "axios";
import ClientDetails from "../components/details/ClientDetail";
import ClientLoans from "../components/details/ClientLoan";
import AddLoanForm from "../components/details/AddLoan";

// AgentRegisterForm Component
const AgentRegisterForm = ({ onAgentAdded }) => {
  const [formData, setFormData] = useState({
    agentusername: "",
    fullname: "",
    email: "",
    fathername: "",
    password: "",
    photo: "", // This would be a URL in your case
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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
        photo: "",
      });

      alert("Agent registered successfully!");

      // Refresh agent list
      if (onAgentAdded) onAgentAdded();
    } catch (error) {
      console.error("Error registering agent:", error);
      alert(
        `Failed to register agent: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <UserPlus size={20} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-medium">Register New Agent</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Full Name
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Father's Name
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Photo URL
            </label>
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

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalLoanDisbursed: 0,
    totalAmountRecovered: 0,
    totalAmountRemaining: 0,
    totalEmisCollected: 0,
    defaulterCount: 0,
  });
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddLoanForm, setShowAddLoanForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const analyticsResponse = await fetch("/api/admin/dashboard");
        const clientsResponse = await fetch("/api/admin/allclients");

        // Use your API service for fetching agents
        const agentsResponse = await getAllAgents();

        if (analyticsResponse.ok && clientsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          const clientsData = await clientsResponse.json();

          setAnalytics(analyticsData.data);
          setClients(clientsData.data);
          setAgents(agentsResponse.data);
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchAgents();
    fetchClients();
    dashData();
  }, []);

  const [showForm, setShowForm] = useState(false); // State to manage form visibility
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [addingLoanClientId, setAddingLoanClientId] = useState(null);

  const [viewMode, setViewMode] = useState("clients");

  const handleClientAdded = () => {
    setShowForm(false); // Close the form after a client is added
    fetchClients(); // Refresh the client list
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(clientId);
        alert("Client deleted successfully!");
        setClients(clients.filter((client) => client._id !== clientId));
      } catch (error) {
        console.error("Error deleting client:", error);
        alert(
          `Failed to delete client: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const handleViewLoans = () => {
    if (onViewLoans) {
      onViewLoans(); // call the parent function to switch view
    }
  };
  const handleBackToClient = () => {
    setViewMode("clientDetails");
    setSelectedLoanId(null);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Redirect to login page or update state
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle delete agent
  const handleDeleteAgent = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await deleteAgent(id);
        alert("Agent deleted successfully!");

        // Optimistically update the state by removing the deleted agent
        setAgents(agents.filter((agent) => agent._id !== id));
      } catch (err) {
        alert("Failed to delete agent.");
        console.error("Error deleting agent:", err);
      }
    }
  };

  // Fetch agents function
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
  const dashData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboardAnalyticsData();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert(
        `Error fetching data: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

 
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      alert(
        `Error fetching clients: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (clientId) => {
    setSelectedClientId(clientId);
    setViewMode("clientDetails"); // default to Client Detail view first
  };
  // Filter agents based on search term
  const filteredAgents = agents.filter(
    (agent) =>
      agent.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentusername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare chart data
  const loanDistributionData = [
    { name: "Recovered", value: analytics.totalAmountRecovered },
    { name: "Remaining", value: analytics.totalAmountRemaining },
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  // Mock time series data (you'd replace this with actual data)
  const loanTimeSeriesData = [
    { name: "Jan", disbursed: 4000, recovered: 2400 },
    { name: "Feb", disbursed: 3000, recovered: 1398 },
    { name: "Mar", disbursed: 2000, recovered: 9800 },
    { name: "Apr", disbursed: 2780, recovered: 3908 },
    { name: "May", disbursed: 1890, recovered: 4800 },
    { name: "Jun", disbursed: 2390, recovered: 3800 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader size={36} className="animate-spin text-blue-600 mb-4" />
          <div className="text-xl font-semibold text-gray-700">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">FinanceHub</h1>
            <span className="ml-2 text-sm bg-blue-700 px-2 py-1 rounded">
              Admin
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md ">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <nav className="mt-6">
            <div
              className={`flex items-center px-6 py-3 cursor-pointer ${
                activeView === "dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("dashboard")}
            >
              <BarChartIcon className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </div>
            <div
              className={`flex items-center px-6 py-3 cursor-pointer ${
                activeView === "clients"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("clients")}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Clients</span>
            </div>
            <div
              className={`flex items-center px-6 py-3 cursor-pointer ${
                activeView === "agents"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("agents")}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              <span>Agents</span>
            </div>
            <div
              className={`flex items-center px-6 py-3 cursor-pointer ${
                activeView === "loans"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setActiveView("loans")}
            >
              <CreditCard className="w-5 h-5 mr-3" />
              <span>Loans</span>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div
                className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <div className="bg-white p-4 shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {activeView === "dashboard" && "Dashboard Overview"}
              {activeView === "clients" && "Client Management"}
              {activeView === "agents" && "Agent Management"}
              {activeView === "loans" && "Loan Management"}
            </h2>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
                A
              </div>
              <span className="text-gray-700">Admin</span>
            </div>
          </div>

          {/* Dashboard Content */}
          {activeView === "dashboard" && (
            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">Total Loans</h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹ {analytics.totalLoanDisbursed.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">
                        Amount Recovered
                      </h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹ {analytics.totalAmountRecovered.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">EMIs Collected</h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.totalEmisCollected}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-gray-500 text-sm">Defaulters</h3>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics.defaulterCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-4">
                    Loan Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={loanDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {loanDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `₹ ${value.toLocaleString()}`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-4">Loan Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={loanTimeSeriesData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="disbursed"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="recovered"
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Sample data - would be replaced with real client activity */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Client A
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">$1,200</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Today
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Client B
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">$800</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Defaulted
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Yesterday
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Clients View */}
          {activeView === "clients" && (
            <div className="p-6">
              {/* If a client is selected, show ClientDetails */}
              {selectedClientId ? (
                viewMode === "clientDetails" ? (
                  <ClientDetails
                    clientId={selectedClientId}
                    onBack={() => setSelectedClientId(null)}
                    onViewLoans={() => setViewMode("clientLoans")}
                  />
                ) : (
                  <ClientLoans
                    clientId={selectedClientId}
                    onBack={() => setViewMode("clientDetails")}
                    onViewLoanDetails={(loanId) => {
                      // optional
                    }}
                  />
                )
              ) : (
                //client list
                <>
                  <div className="mb-6 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Client List</h3>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Client
                    </button>
                  </div>

                  {/* Conditionally render the AddClientForm */}
                  {showForm && (
                    <AddClientForm onClientAdded={handleClientAdded} />
                  )}

                  {/* Client list table */}
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {clients.map((client, index) => (
                            <tr
                              key={client._id || index}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {client.clientPhoto ? (
                                      <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={client.clientPhoto}
                                        alt=""
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        {client.clientName
                                          ?.charAt(0)
                                          ?.toUpperCase() || "C"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {client.clientName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {client.clientPhone}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {client.clientAddress}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() =>
                                    setSelectedClientId(client._id)
                                  }
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    setAddingLoanClientId(client._id)
                                  }
                                  className="text-green-600 hover:text-green-900 mr-3"
                                >
                                  Add Loan
                                </button>

                                {addingLoanClientId === client._id && (
                                  <div className="mt-6">
                                    <AddLoanForm
                                      clientId={client._id}
                                      onClose={() =>
                                        setAddingLoanClientId(null)
                                      }
                                      onLoanAdded={() => {
                                        fetchClients(); // Refresh after adding loan
                                      }}
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => handleDeleteClient(client._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                          {clients.length === 0 && (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-6 py-4 text-center text-sm text-gray-500"
                              >
                                No clients found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Agents View */}
          {activeView === "agents" && (
            <div className="p-6">
              {/* Agent Registration Form */}
              <AgentRegisterForm onAgentAdded={fetchAgents} />

              {/* Agent List */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Users size={20} className="text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold">Agent Directory</h3>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {agents.length} Agents
                    </span>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
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
                    <Loader
                      size={24}
                      className="animate-spin text-blue-600 mr-2"
                    />
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
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="bg-gray-50 text-left">
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
                                      onClick={() =>
                                        navigate(`/edit-agent/${agent._id}`)
                                      }
                                      className="p-1 rounded-md hover:bg-gray-100"
                                    >
                                      <User
                                        size={16}
                                        className="text-blue-600"
                                      />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteAgent(agent._id)
                                      }
                                      className="p-1 rounded-md hover:bg-gray-100"
                                    >
                                      <Trash2
                                        size={16}
                                        className="text-red-600"
                                      />
                                    </button>
                                  </div>
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
          )}

          {/* Loans View */}
          {activeView === "loans" && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-6">Loan Management</h3>
              {/* Loan management content would go here */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-500">
                  Loan management functionality coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
