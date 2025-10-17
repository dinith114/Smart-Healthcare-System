import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import PatientRegistration from "./PatientRegistration";
import PatientList from "./PatientList";
import StaffProfile from "../../components/staff/StaffProfile";

export default function StaffDashboard() {
  const { logout, user } = useAuth();
  const [activeView, setActiveView] = useState("register");

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
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-lg">
                Smart Healthcare System
              </span>
              <span className="block text-xs text-white/80">Staff Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.username}</div>
              <div className="text-xs text-white/80">Staff Member</div>
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
        <h1 className="text-3xl font-bold text-[#2d3b2b] mb-6">
          Staff Dashboard
        </h1>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setActiveView("register")}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              activeView === "register"
                ? "border-[#7e957a] bg-white shadow-lg"
                : "border-[#b9c8b4] bg-white hover:border-[#7e957a]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  activeView === "register" ? "bg-[#7e957a]" : "bg-[#f0f5ef]"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeView === "register" ? "text-white" : "text-[#7e957a]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2d3b2b] mb-1">
                  Register New Patient
                </h3>
                <p className="text-sm text-gray-600">
                  Add a new patient to the system
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveView("list")}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              activeView === "list"
                ? "border-[#7e957a] bg-white shadow-lg"
                : "border-[#b9c8b4] bg-white hover:border-[#7e957a]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  activeView === "list" ? "bg-[#7e957a]" : "bg-[#f0f5ef]"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeView === "list" ? "text-white" : "text-[#7e957a]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2d3b2b] mb-1">
                  Patient List
                </h3>
                <p className="text-sm text-gray-600">
                  View registered patients
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveView("profile")}
            className={`p-6 rounded-2xl border-2 transition-all text-left ${
              activeView === "profile"
                ? "border-[#7e957a] bg-white shadow-lg"
                : "border-[#b9c8b4] bg-white hover:border-[#7e957a]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-lg ${
                  activeView === "profile" ? "bg-[#7e957a]" : "bg-[#f0f5ef]"
                }`}
              >
                <svg
                  className={`w-6 h-6 ${
                    activeView === "profile" ? "text-white" : "text-[#7e957a]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2d3b2b] mb-1">
                  My Profile
                </h3>
                <p className="text-sm text-gray-600">
                  View and edit your account
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Content Area */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={activeView === "register" ? "" : "bg-white rounded-2xl border border-[#b9c8b4] p-6"}
        >
          {activeView === "register" && <PatientRegistration />}
          {activeView === "list" && <PatientList />}
          {activeView === "profile" && <StaffProfile />}
        </motion.div>
      </main>
    </motion.div>
  );
}
