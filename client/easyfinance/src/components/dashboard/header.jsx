// File: dashboard/Header.jsx
import React from "react";

const Header = () => {
  return (
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
  );
};

export default Header;

// File: dashboard/Sidebar.jsx

