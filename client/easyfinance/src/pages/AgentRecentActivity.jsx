import { useEffect, useState } from "react";
import { AgetAgentEmiCollection } from "../services/agentAPI";
import { Loader2, TrendingUp, Users, IndianRupee, Calendar } from "lucide-react";

const RecentActivity = () => {
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState({
    totalAmount: 0,
    clientCount: 0,
    paidCount: 0,
    partialCount: 0,
    pendingCount: 0
  });

  const storedAgent = localStorage.getItem("agent");
  const agentId = storedAgent ? JSON.parse(storedAgent)?._id : null;

  useEffect(() => {
    if (!agentId) return;
    
    setLoading(true);
    AgetAgentEmiCollection(agentId)
      .then((res) => {
        console.log("Agent EMI Collection Response:", res);
        
        const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
        const todayEmis = res.data.emiCollectionData?.filter((item) => {
          return item.date?.slice(0, 10) === today;
        }) || [];
        
        setActivity(todayEmis);
        
        // Calculate analytics
        const totalAmount = todayEmis.reduce((sum, item) => sum + (Number(item.amountCollected) || 0), 0);
        const uniqueClients = new Set(todayEmis.map(item => item.clientName));
        const paidCount = todayEmis.filter(item => item.status === "Paid").length;
        const partialCount = todayEmis.filter(item => item.status === "Partial").length;
        const pendingCount = todayEmis.filter(item => item.status === "Pending").length;
        
        setAnalytics({
          totalAmount,
          clientCount: uniqueClients.size,
          paidCount,
          partialCount,
          pendingCount
        });
        
        setError("");
      })
      .catch(() => {
        setError("Failed to load recent activity.");
        setActivity([]);
      })
      .finally(() => setLoading(false));
  }, [agentId]);

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-blue-500" />
          Today's EMI Collection
        </h2>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <>
          {/* Analytics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 flex flex-col">
              <div className="text-blue-600 text-sm font-medium mb-1">Total Collection Today</div>
              <div className="flex items-center">
                <IndianRupee className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-xl font-bold">{formatCurrency(analytics.totalAmount)}</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 flex flex-col">
              <div className="text-green-600 text-sm font-medium mb-1">Clients</div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xl font-bold">{analytics.clientCount}</span>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 flex flex-col">
              <div className="text-purple-600 text-sm font-medium mb-1">Transactions</div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-xl font-bold">{activity.length}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <div className="text-gray-600 text-sm font-medium mb-1">Status</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600 font-medium">{analytics.paidCount} Paid</span>
                <span className="text-yellow-600 font-medium">{analytics.partialCount} Partial</span>
                <span className="text-red-600 font-medium">{analytics.pendingCount} Pending</span>
              </div>
            </div>
          </div>

          {/* Activity List */}
          {activity.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 font-medium">No collection activity for today.</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {activity.map((item, index) => (
                  <li key={index} className="hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-center p-4">
                      <div>
                        <div className="font-medium text-gray-800">{item.clientName}</div>
                        <div className="text-sm text-gray-600">
                          Loan #{item.loanNumber}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="font-bold text-gray-800">₹{formatCurrency(item.amountCollected)}</div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : item.status === "Partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentActivity;