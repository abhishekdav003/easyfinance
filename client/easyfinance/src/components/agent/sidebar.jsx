import React, { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Wallet, 
  LogOut, 
  Menu, 
  X,
  Home
} from "lucide-react";

const ResponsiveSidebar = ({ activeView, setActiveView, handleLogout, darkMode }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={20} /> },
    { id: "clients", label: "Clients", icon: <Users size={20} /> },
    { id: "emiCollection", label: "EMI Collection", icon: <Wallet size={20} /> },
  ];

  // Check if we're on mobile view
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className={`fixed top-4 left-4 z-30 p-2 rounded-md shadow-md transition-colors ${
            darkMode 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
          }`}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      )}
      
      {/* Desktop Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-64 transition-all duration-300 shadow-lg z-20 ${
          isMobile ? 'hidden' : 'block'
        } ${
          darkMode 
            ? 'bg-gray-800/90 border-r border-gray-700' 
            : 'bg-white/90 border-r border-gray-200'
        } backdrop-blur-md backdrop-filter`}
      >
        <SidebarContent 
          activeView={activeView} 
          setActiveView={setActiveView} 
          handleLogout={handleLogout}
          menuItems={menuItems}
          darkMode={darkMode}
        />
      </div>
      
      {/* Mobile Sidebar (Slide-in) */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-30 transition-all duration-300 ${
            isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 ${darkMode ? 'bg-black/50' : 'bg-black/20'} backdrop-blur-sm`}
            onClick={closeMobileSidebar}
          ></div>
          
          {/* Sidebar */}
          <div 
            className={`absolute top-0 bottom-0 left-0 w-64 shadow-xl transition-transform duration-300 ${
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } ${
              darkMode 
                ? 'bg-gray-800 border-r border-gray-700' 
                : 'bg-white border-r border-gray-200'
            }`}
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={closeMobileSidebar}
                className={`p-1 rounded-full ${
                  darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <SidebarContent 
              activeView={activeView} 
              setActiveView={(view) => {
                setActiveView(view);
                closeMobileSidebar();
              }} 
              handleLogout={handleLogout}
              menuItems={menuItems}
              darkMode={darkMode}
            />
          </div>
        </div>
      )}
    </>
  );
};

const SidebarContent = ({ activeView, setActiveView, handleLogout, menuItems, darkMode }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 flex items-center">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-600 to-indigo-700' 
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        } text-white font-bold text-xl shadow-md mr-2`}>
          <Home size={24} />
        </div>
        <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          LoanApp
        </span>
      </div>
      
      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-all ${
                activeView === item.id
                  ? (darkMode 
                      ? 'bg-blue-600/20 text-blue-300 border-l-4 border-blue-500' 
                      : 'bg-blue-50 text-blue-700 border-l-4 border-blue-500')
                  : (darkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${
            darkMode
              ? 'text-red-300 hover:bg-red-900/20'
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut size={20} className="mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ResponsiveSidebar;