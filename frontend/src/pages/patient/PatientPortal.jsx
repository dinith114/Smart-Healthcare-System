import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import HealthCardDisplay from "../../components/patient/HealthCardDisplay";
import EditProfileModal from "../../components/patient/EditProfileModal";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

export default function PatientPortal() {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [healthCard, setHealthCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, cardRes] = await Promise.all([
        api.get("/patient/profile"),
        api.get("/patient/health-card")
      ]);
      setProfile(profileRes.data);
      setHealthCard(cardRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-[#8aa082]/30">
      {/* Header */}
      <header className="bg-[#7e957a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-lg">Smart Healthcare System</span>
              <span className="block text-xs text-white/80">Patient Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium">{profile?.name || user?.username}</div>
              <div className="text-xs text-white/80">Patient</div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-[#5b6f59] hover:bg-[#4f614e] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">NIC Number</label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.nic}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-[#2d3b2b] font-medium">{formatDate(profile?.dob)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Age</label>
                    <p className="text-[#2d3b2b] font-medium">{calculateAge(profile?.dob)} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-[#2d3b2b] font-medium">{profile?.address || "-"}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#b9c8b4]">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-gray-600">Registration Date</label>
                      <p className="font-medium text-[#2d3b2b]">{formatDate(profile?.registeredDate)}</p>
                    </div>
                    <div>
                      <label className="text-gray-600">Status</label>
                      <p>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {profile?.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Card Section */}
            <div className="lg:col-span-1">
              <HealthCardDisplay healthCard={healthCard} patientName={profile?.name} />
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
    </div>
  );
}

