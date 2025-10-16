import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { motion } from "framer-motion";
import StatsCards from "../../components/admin/StatsCards";
import StaffManagement from "./StaffManagement";
import PatientOverview from "./PatientOverview";
import PositionManagement from "./PositionManagement";
import AdminProfile from "../../components/admin/AdminProfile";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("staff");
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await api.get("/admin/statistics");
      setStatistics(response.data);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statistics) {
    return (
      <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#8aa082]/30"
    >
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-[#7e957a] text-white"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-lg">Smart Healthcare System</span>
              <span className="block text-xs text-white/80">Admin Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.username}</div>
              <div className="text-xs text-white/80">Administrator</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-[#5b6f59] hover:bg-[#4f614e] transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-[#2d3b2b] mb-6"
        >
          Admin Dashboard
        </motion.h1>

        {/* Statistics Cards */}
        <StatsCards statistics={statistics} loading={loading} />

        {/* Navigation Tabs */}
        <div className="bg-white rounded-t-2xl border-b border-[#b9c8b4] mt-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === "staff"
                  ? "text-[#7e957a] border-b-2 border-[#7e957a]"
                  : "text-gray-600 hover:text-[#7e957a]"
              }`}
            >
              Staff Management
            </button>
            <button
              onClick={() => setActiveTab("positions")}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === "positions"
                  ? "text-[#7e957a] border-b-2 border-[#7e957a]"
                  : "text-gray-600 hover:text-[#7e957a]"
              }`}
            >
              Positions
            </button>
            <button
              onClick={() => setActiveTab("patients")}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === "patients"
                  ? "text-[#7e957a] border-b-2 border-[#7e957a]"
                  : "text-gray-600 hover:text-[#7e957a]"
              }`}
            >
              Patient Overview
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === "profile"
                  ? "text-[#7e957a] border-b-2 border-[#7e957a]"
                  : "text-gray-600 hover:text-[#7e957a]"
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-b-2xl border border-[#b9c8b4] border-t-0 p-6"
        >
          {activeTab === "staff" && <StaffManagement onStaffChange={loadStatistics} />}
          {activeTab === "positions" && <PositionManagement />}
          {activeTab === "patients" && <PatientOverview />}
          {activeTab === "profile" && <AdminProfile />}
        </motion.div>
      </main>
    </motion.div>
  );
}

