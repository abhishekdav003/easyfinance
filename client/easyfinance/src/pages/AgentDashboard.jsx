import React, { useState, useEffect } from "react";
import {
  getAllAgentClients,
  getAgentDashboardAnalyticsData,
  collectEmi,
  logoutAgent,
} from "../services/agentAPI";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "../components/agent/dashOverview";
import ClientManagement from "../components/agent/client";
import EmiCollection from "../components/details/CollectEmi";
import ResponsiveSidebar from "../components/agent/sidebar";
import { 
  Loader, 
  Moon, 
  Sun, 
  BarChart3, 
  Users, 
  Wallet,
  Bell,
  Menu
} from "lucide-react";

const AgentDashboard = () => {
  // State management
  const [analytics, setAnalytics] = useState({
    totalClientsAssigned: 0,
    totalEmiCollected: 0,
    totalAmountCollected: 0,
    pendingEmis: 0,
    defaulterCount: 0,
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [collectingEmiClientId, setCollectingEmiClientId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const navigate = useNavigate();

  // Window resize handler for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial data loading and theme setup
  useEffect(() => {
    // Check if user has a preferred theme stored or use system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    // Add CSS variable for blur backdrop support
    document.documentElement.style.setProperty('--blur-bg', 'rgba(255, 255, 255, 0.7)');
    document.documentElement.style.setProperty('--blur-bg-dark', 'rgba(17, 24, 39, 0.75)');
    
    // Fetch dashboard data
    fetchDashboardData();
    
    // Dummy notifications - would come from backend in real implementation
    setNotifications([
      { id: 1, message: "Client Rahul has an EMI due today", time: "2 hours ago" },
      { id: 2, message: "New client assigned to you", time: "Yesterday" },
      { id: 3, message: "EMI collection target reached 75%", time: "3 days ago" }
    ]);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const analyticsResponse = await getAgentDashboardAnalyticsData();
      const clientsResponse = await getAllAgentClients();

      setAnalytics(analyticsResponse.data);
      setClients(clientsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleClientAdded = () => {
    setShowForm(false);
    fetchClients();
  };

  const handleEmiCollected = async (clientId, amount, emiDate) => {
    try {
      await collectEmi(clientId, { amount, date: emiDate });
      alert("EMI collected successfully!");
      setCollectingEmiClientId(null);
      fetchDashboardData(); // Refresh data after EMI collection
    } catch (error) {
      console.error("Error collecting EMI:", error);
      alert(`Failed to collect EMI: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logoutAgent();
        alert("Logged out successfully!");
        window.location.href = "/login";
      } catch (error) {
        console.error("Logout failed:", error);
        alert(`Failed to logout: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getAllAgentClients();
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      alert(`Error fetching clients: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClients = async () => {
    if (!searchTerm.trim()) {
      fetchClients();
      return;
    }
    
    try {
      setLoading(true);
      const response = await searchClients(searchTerm);
      setClients(response.data);
    } catch (error) {
      console.error("Error searching clients:", error);
      alert(`Search failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search term (client-side filtering)
  const filteredClients = clients.filter(
    (client) =>
      client.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900'
      }`}>
        <div className="flex flex-col items-center backdrop-blur-sm p-8 rounded-xl shadow-lg bg-white/10 dark:bg-gray-800/30">
          <Loader size={48} className={`animate-spin ${darkMode ? 'text-blue-400' : 'text-blue-500'} mb-4`} />
          <div className="text-xl font-semibold">
            Loading agent dashboard...
          </div>
        </div>
      </div>
    );
  }

  const viewIcons = {
    dashboard: <BarChart3 size={20} />,
    clients: <Users size={20} />,
    emiCollection: <Wallet size={20} />
  };

  // Determine if we're on mobile view
  const isMobile = windowSize.width < 1024;

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900'
    }`}>
      {/* Responsive Sidebar Component */}
      <ResponsiveSidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        handleLogout={handleLogout} 
        darkMode={darkMode}
      />

      {/* Main Content Container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <div className={`sticky top-0 p-4 backdrop-blur-md backdrop-filter flex justify-between items-center z-10 ${
            darkMode 
              ? 'bg-gray-800/70 border-b border-gray-700 shadow-lg' 
              : 'bg-white/70 border-b border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center">
              {/* Space for hamburger menu on mobile */}
              {isMobile && <div className="w-8 mr-2"></div>}
              
              {viewIcons[activeView] && (
                <span className={`mr-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {viewIcons[activeView]}
                </span>
              )}
              <h2 className="text-xl font-semibold truncate">
                {activeView === "dashboard" && "Agent Dashboard"}
                {activeView === "clients" && "Client Management"}
                {activeView === "emiCollection" && "EMI Collection"}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  className={`p-2 rounded-full relative ${
                    darkMode 
                      ? 'bg-gray-700/80 text-blue-300 hover:bg-gray-600' 
                      : 'bg-gray-200/80 text-blue-600 hover:bg-gray-300/80'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {notifications.length}
                  </span>
                </button>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 ${
                  darkMode 
                    ? 'bg-gray-700/80 text-yellow-300 hover:bg-gray-600 hover:text-yellow-200' 
                    : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 hover:text-gray-900'
                }`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-green-600 to-teal-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-500'
                } text-white shadow-md`}>
                  A
                </div>
                <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} ${isMobile ? 'hidden' : 'block'}`}>Agent</span>
              </div>
            </div>
          </div>

          {/* Main Content with Glass Effect - Scrollable Area */}
          <div className="p-4">
            <div className={`rounded-xl ${
              darkMode 
                ? 'bg-gray-800/30 shadow-xl backdrop-blur-md backdrop-filter' 
                : 'bg-white/60 shadow-lg backdrop-blur-md backdrop-filter'
            } p-4`}>
              {/* Dashboard Content */}
              {activeView === "dashboard" && (
                <DashboardOverview 
                  analytics={analytics} 
                  notifications={notifications}
                  darkMode={darkMode} 
                  transparentCharts={true} 
                />
              )}

              {/* Clients View */}
              {activeView === "clients" && (
                <ClientManagement 
                  clients={filteredClients}
                  selectedClientId={selectedClientId}
                  setSelectedClientId={setSelectedClientId}
                  showForm={showForm}
                  setShowForm={setShowForm}
                  handleClientAdded={handleClientAdded}
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm}
                  handleSearchClients={handleSearchClients}
                  collectingEmiClientId={collectingEmiClientId}
                  setCollectingEmiClientId={setCollectingEmiClientId}
                  handleEmiCollected={handleEmiCollected}
                  darkMode={darkMode}
                  transparentCharts={true}
                  isMobile={isMobile}
                />
              )}

              {/* EMI Collection View */}
              {activeView === "emiCollection" && (
                <EmiCollection 
                  clients={filteredClients}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  handleSearchClients={handleSearchClients}
                  collectingEmiClientId={collectingEmiClientId}
                  setCollectingEmiClientId={setCollectingEmiClientId}
                  handleEmiCollected={handleEmiCollected}
                  darkMode={darkMode}
                  isMobile={isMobile}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;