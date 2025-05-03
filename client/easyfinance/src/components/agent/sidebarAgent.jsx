import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Wallet,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

const ResponsiveSidebar = ({ activeView, setActiveView, handleLogout, darkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "clients", label: "Clients", icon: Users },
    { id: "emiCollection", label: "EMI Collection", icon: Wallet },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuItemClick = (id) => {
    setActiveView(id);
    if (windowWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu toggle button */}
      {!isMobileMenuOpen && windowWidth < 1024 && (
        <div className="fixed top-4 left-4 z-30">
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-lg transition duration-200 ${
              darkMode
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-white text-gray-800 hover:bg-gray-100 shadow-md"
            }`}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
        </div>
      )}

      {/* Sidebar container */}
      <div
        className={`fixed top-0 h-screen z-20 transition-all duration-300 ${
          darkMode
            ? "bg-gray-900/90 border-r border-gray-700 shadow-xl"
            : "bg-white/90 border-r border-gray-200 shadow-lg"
        } backdrop-blur-md flex flex-col
        ${
          windowWidth < 1024
            ? isMobileMenuOpen
              ? "left-0 w-64"
              : "-left-64 w-64"
            : "left-0 w-64"
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b flex justify-between items-center ${
            darkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mr-2 text-white font-bold text-xl shadow-md ${
                darkMode
                  ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}
            >
              <Home size={24} />
            </div>
            <span
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Agent Panel
            </span>
          </div>

          {windowWidth < 1024 && (
            <button onClick={toggleMobileMenu} className="p-1">
              <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-grow overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center px-6 py-3 my-1 mx-2 cursor-pointer rounded-lg transition duration-200 ${
                  isActive
                    ? darkMode
                      ? "bg-indigo-900/50 text-indigo-300 font-medium"
                      : "bg-indigo-50 text-indigo-700 font-medium shadow-sm"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-800/70"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${
                    isActive
                      ? darkMode
                        ? "text-indigo-400"
                        : "text-indigo-600"
                      : darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div
                    className={`ml-auto w-1 h-5 ${
                      darkMode ? "bg-indigo-400" : "bg-indigo-600"
                    } rounded-full`}
                  ></div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className={`border-t mt-auto mb-6 pt-4 ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div
            className={`flex items-center px-6 py-3 my-1 mx-2 rounded-lg cursor-pointer transition duration-200 ${
              darkMode
                ? "text-gray-300 hover:bg-red-900/50 hover:text-red-300"
                : "text-gray-600 hover:bg-red-50 hover:text-red-600"
            }`}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResponsiveSidebar;