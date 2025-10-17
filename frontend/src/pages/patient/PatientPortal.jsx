import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import HealthCardDisplay from "../../components/patient/HealthCardDisplay";
import EditProfileModal from "../../components/patient/EditProfileModal";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import PatientNavBar from "../../components/patient/PatientNavBar";
import Footer from "../../components/patient/Footer";

export default function PatientPortal() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [healthCard, setHealthCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, cardRes] = await Promise.all([
        api.get("/patient/profile"),
        api.get("/patient/health-card"),
      ]);
      setProfile(profileRes.data);
      setHealthCard(cardRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [location.pathname, loadData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-[#8aa082]/30 flex flex-col">
      <PatientNavBar patientName={profile?.name} />

      <main className="flex-grow max-w-6xl mx-auto px-6 py-6 w-full">
        <h1 className="text-3xl font-bold text-[#2d3b2b] mb-6">
          My Health Portal
        </h1>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-2xl border border-[#b9c8b4] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#2d3b2b]">
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 text-sm bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {profile?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      NIC Number
                    </label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.nic}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Date of Birth
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {formatDate(profile?.dob)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Age
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {calculateAge(profile?.dob)} years
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Gender
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {profile?.gender}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {profile?.phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {profile?.email}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">
                      Address
                    </label>
                    <p className="text-[#2d3b2b] font-medium">
                      {profile?.address || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#b9c8b4]">
                  <div className="grid grid-cols-3 gap-4 text-sm items-center">
                    <div>
                      <label className="text-gray-600">Registration Date</label>
                      <p className="font-medium text-[#2d3b2b]">
                        {formatDate(profile?.registeredDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600">Status</label>
                      <p>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {profile?.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => navigate("/patient/dashboard")}
                        className="w-full px-4 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
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
                        Medical Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Card Section */}
            <div className="lg:col-span-1">
              <HealthCardDisplay
                healthCard={healthCard}
                patientName={profile?.name}
              />
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            profile={profile}
            onSuccess={loadData}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
