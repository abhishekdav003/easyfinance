// Example implementation for DashOverview component with transparent charts
// File: components/dashboard/dashOverview.jsx

import React from "react";
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as LineTooltip,
} from "recharts";
import { CreditCard, TrendingUp, Users, Clock } from "lucide-react";

const COLORS = ["#0088FE", "#FF8042"];
const DARK_COLORS = ["#60a5fa", "#fb923c"];

const DashboardOverview = ({ analytics, darkMode, transparentCharts }) => {
  // Prepare data for pie chart
  const pieData = [
    { name: "Recovered", value: analytics.totalAmountRecovered },
    { name: "Remaining", value: analytics.totalAmountRemaining },
  ];

  // Calculate percentages
  const totalAmount =
    analytics.totalAmountRecovered + analytics.totalAmountRemaining;
  const recoveredPercentage = Math.round(
    (analytics.totalAmountRecovered / totalAmount) * 100
  );
  const remainingPercentage = 100 - recoveredPercentage;

  // Sample data for line chart - replace with actual data in your implementation
  const lineData = [
    { name: "Jan", disbursed: 4000, recovered: 2400 },
    { name: "Feb", disbursed: 3000, recovered: 1398 },
    { name: "Mar", disbursed: 2000, recovered: 9800 },
    { name: "Apr", disbursed: 2780, recovered: 3908 },
    { name: "May", disbursed: 1890, recovered: 4800 },
    { name: "Jun", disbursed: 2390, recovered: 3800 },
  ];

  const chartColors = darkMode ? DARK_COLORS : COLORS;

  const statCardClass = `stat-card p-6 ${
    darkMode ? "text-white" : "text-gray-800"
  }`;

  const chartContainerClass = `chart-container rounded-xl p-4 ${
    transparentCharts
      ? "bg-transparent"
      : darkMode
      ? "bg-gray-800/80"
      : "bg-white/80"
  }`;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Loans Card */}
        <div className={statCardClass}>
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Total Loans
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ₹ {analytics.totalLoanDisbursed.toLocaleString()}
              </h3>
            </div>
            <div
              className={`p-3 rounded-full ${
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              }`}
            >
              <CreditCard
                className={darkMode ? "text-blue-400" : "text-blue-600"}
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Amount Recovered Card */}
        <div className={statCardClass}>
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Amount Recovered
              </p>
              <h3 className="text-2xl font-bold mt-1">
                ₹ {analytics.totalAmountRecovered.toLocaleString()}
              </h3>
            </div>
            <div
              className={`p-3 rounded-full ${
                darkMode ? "bg-green-900/30" : "bg-green-100"
              }`}
            >
              <TrendingUp
                className={darkMode ? "text-green-400" : "text-green-600"}
                size={24}
              />
            </div>
          </div>
        </div>

        {/* EMIs Collected Card */}
        <div className={statCardClass}>
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                EMIs Collected
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analytics.totalEmisCollected}
              </h3>
            </div>
            <div
              className={`p-3 rounded-full ${
                darkMode ? "bg-indigo-900/30" : "bg-indigo-100"
              }`}
            >
              <Clock
                className={darkMode ? "text-indigo-400" : "text-indigo-600"}
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Defaulters Card */}
        <div className={statCardClass}>
          <div className="flex justify-between">
            <div>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Defaulters
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analytics.defaulterCount}
              </h3>
            </div>
            <div
              className={`p-3 rounded-full ${
                darkMode ? "bg-red-900/30" : "bg-red-100"
              }`}
            >
              <Users
                className={darkMode ? "text-red-400" : "text-red-600"}
                size={24}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className={`${chartContainerClass} w-full`}>
          <h3
            className={`text-lg sm:text-xl font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Loan Recovery Status
          </h3>

          <div className="w-full h-[300px] sm:h-[320px] md:h-[340px] lg:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹ ${value.toLocaleString()}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    backgroundColor: darkMode
                      ? "rgba(30, 41, 59, 0.85)"
                      : "rgba(255, 255, 255, 0.85)",
                    color: darkMode ? "#fff" : "#000",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    fontSize: "0.85rem",
                    paddingTop: "0.5rem",
                  }}
                  formatter={(value) => (
                    <span style={{ color: darkMode ? "#e5e7eb" : "#374151" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col xs:flex-row justify-around items-center gap-2 mt-4">
            <div>
              <p
                className={`font-medium ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Recovered: {recoveredPercentage}%
              </p>
            </div>
            <div>
              <p
                className={`font-medium ${
                  darkMode ? "text-orange-400" : "text-orange-600"
                }`}
              >
                Remaining: {remainingPercentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className={chartContainerClass}>
          <h3
            className={`text-lg font-semibold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Monthly Loan Activity
          </h3>
          <div className="chart-responsive-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
                  }
                />
                <XAxis
                  dataKey="name"
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                />
                <YAxis
                  stroke={darkMode ? "#94a3b8" : "#64748b"}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <LineTooltip
                  formatter={(value) => [
                    `₹ ${value.toLocaleString()}`,
                    undefined,
                  ]}
                  contentStyle={{
                    backgroundColor: darkMode
                      ? "rgba(30, 41, 59, 0.85)"
                      : "rgba(255, 255, 255, 0.85)",
                    color: darkMode ? "#fff" : "#000",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="disbursed"
                  stroke={darkMode ? "#a5b4fc" : "#4f46e5"}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="recovered"
                  stroke={darkMode ? "#86efac" : "#10b981"}
                  strokeWidth={2}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: darkMode ? "#e5e7eb" : "#374151" }}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
