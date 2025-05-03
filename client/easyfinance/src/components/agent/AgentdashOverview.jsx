import React from "react";
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  Bell
} from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const DashboardOverview = ({ analytics, notifications, darkMode, transparentCharts }) => {
  // Sample data for charts - in a real app, this would come from the backend
  const emiCollectionData = [
    { name: 'Jan', collected: 85 },
    { name: 'Feb', collected: 90 },
    { name: 'Mar', collected: 78 },
    { name: 'Apr', collected: 95 },
    { name: 'May', collected: 88 },
    { name: 'Jun', collected: 92 },
  ];

  const clientStatusData = [
    { name: 'Regular', value: 65 },
    { name: 'Overdue', value: 25 },
    { name: 'Defaulter', value: 10 },
  ];

  const COLORS = ['#4ade80', '#facc15', '#f87171'];

  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCardBgClass = (darkMode) => {
    return darkMode 
      ? 'bg-gray-800/70 border border-gray-700 shadow-md' 
      : 'bg-white/70 border border-gray-200 shadow';
  };

  const getIconBgClass = (color, darkMode) => {
    const colorMap = {
      blue: darkMode ? 'bg-blue-400/20 text-blue-400' : 'bg-blue-100 text-blue-600',
      green: darkMode ? 'bg-green-400/20 text-green-400' : 'bg-green-100 text-green-600',
      yellow: darkMode ? 'bg-yellow-400/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
      red: darkMode ? 'bg-red-400/20 text-red-400' : 'bg-red-100 text-red-600',
      purple: darkMode ? 'bg-purple-400/20 text-purple-400' : 'bg-purple-100 text-purple-600',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Clients */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Clients
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {analytics.totalClientsAssigned}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${getIconBgClass('blue', darkMode)}`}>
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Total EMIs Collected */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                EMIs Collected
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {analytics.totalEmiCollected}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${getIconBgClass('green', darkMode)}`}>
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        {/* Total Amount Collected */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Amount Collected
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {formatIndianCurrency(analytics.totalAmountCollected)}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${getIconBgClass('purple', darkMode)}`}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* Pending EMIs */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending EMIs
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {analytics.pendingEmis}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${getIconBgClass('yellow', darkMode)}`}>
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Defaulters */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Defaulters
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {analytics.defaulterCount}
              </div>
            </div>
            <div className={`p-2 rounded-lg ${getIconBgClass('red', darkMode)}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* EMI Collection Trend */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)} lg:col-span-2`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-500" />
              EMI Collection Trend
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emiCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#d1d5db' : '#4b5563' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: darkMode ? '#d1d5db' : '#4b5563' }}
                  unit="%" 
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Collection Rate']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb',
                    color: darkMode ? '#f9fafb' : '#111827',
                  }}
                />
                <Bar 
                  dataKey="collected" 
                  fill={darkMode ? '#60a5fa' : '#3b82f6'} 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Status Distribution */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Users size={20} className="mr-2 text-green-500" />
            Client Status
          </h3>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="70%"
                  innerRadius="45%"
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  strokeWidth={darkMode ? 1 : 2}
                  stroke={darkMode ? '#111827' : '#ffffff'}
                >
                  {clientStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    borderColor: darkMode ? '#374151' : '#e5e7eb',
                    color: darkMode ? '#f9fafb' : '#111827',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {clientStatusData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-sm mr-1" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Calendar and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)} lg:col-span-2`}>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Calendar size={20} className="mr-2 text-indigo-500" />
            Today's Collection Schedule
          </h3>
          
          <div className="space-y-4">
            {/* This would be populated from real data */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex justify-between items-center`}>
              <div>
                <div className="font-medium">Rahul Sharma</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">₹5,000 • Due today</div>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-yellow-400/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                Pending
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex justify-between items-center`}>
              <div>
                <div className="font-medium">Priya Patel</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">₹8,000 • Due today</div>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-red-400/20 text-red-300' : 'bg-red-100 text-red-700'}`}>
                Overdue
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex justify-between items-center`}>
              <div>
                <div className="font-medium">Amit Kumar</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">₹3,500 • Due today</div>
              </div>
              <div className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-green-400/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                Ready
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className={`rounded-xl p-4 ${getCardBgClass(darkMode)}`}>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Bell size={20} className="mr-2 text-amber-500" />
            Notifications
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {notifications && notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
              >
                <div className="text-sm">{notification.message}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</div>
              </div>
            ))}
            
            {(!notifications || notifications.length === 0) && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No new notifications
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;