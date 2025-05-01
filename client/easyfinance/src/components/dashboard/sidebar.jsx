import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  CreditCard,
  LogOut,
  BarChart,
  UserCog,
  Landmark,
  Menu,
  X,
} from "lucide-react";

const ResponsiveSidebar = ({
  activeView,
  setActiveView,
  handleLogout,
  darkMode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Track window resize for responsiveness
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
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "clients", label: "Clients", icon: Users },
    { id: "agents", label: "Agents", icon: UserCog },
    { id: "loans", label: "Loans", icon: Landmark },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle menu item click on mobile - closes menu after selection
  const handleMenuItemClick = (id) => {
    setActiveView(id);
    if (windowWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      
      

      {/* Overlay when mobile menu is open */}
      {!isMobileMenuOpen && (
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-lg transition-all duration-200 ${
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

      {/* Sidebar - Desktop (always visible) and Mobile (slide in) */}
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
        <div
          className={`p-6 border-b ${
            darkMode ? "border-gray-700" : "border-gray-100"
          } flex justify-between items-center`}
        >
          <h1
            className={`text-xl font-bold ${
              darkMode ? "text-indigo-400" : "text-indigo-700"
            }`}
          >
            Admin Panel
          </h1>
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-1"
            aria-label="Close menu"
          >
            <X
              className={`w-5 h-5 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        <nav className="mt-6 flex-grow overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center px-6 py-3 my-1 mx-2 cursor-pointer rounded-lg transition-all duration-200 ${
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

        <div
          className={`border-t ${
            darkMode ? "border-gray-700" : "border-gray-200"
          } mt-auto mb-6 pt-4`}
        >
          <div
            className={`flex items-center px-6 py-3 my-1 mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
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
