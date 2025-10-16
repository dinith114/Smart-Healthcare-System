import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ErrorBanner from "../common/ErrorBanner";

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/profile");
      setProfile(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await api.put("/admin/profile/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#2d3b2b]">Admin Profile</h2>
        <p className="text-sm text-gray-600 mt-1">View and manage your account settings</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-white border border-[#b9c8b4] rounded-lg p-6 mb-4">
        <h3 className="font-semibold text-[#2d3b2b] mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Username</label>
            <p className="font-medium text-[#2d3b2b]">{profile?.username}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <p className="font-medium text-[#2d3b2b] capitalize">{profile?.role}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p>
              <span className={`px-2 py-1 text-xs rounded-full ${
                profile?.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}>
                {profile?.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Account Created</label>
            <p className="font-medium text-[#2d3b2b]">{formatDate(profile?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white border border-[#b9c8b4] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#2d3b2b]">Password</h3>
            <p className="text-sm text-gray-600">Change your account password</p>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Current Password *
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                New Password *
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
              >
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setError("");
                }}
                className="px-6 py-2 border border-[#b9c8b4] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

