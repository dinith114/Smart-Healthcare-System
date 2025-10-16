import { useState, useEffect } from "react";
import { api } from "../../services/api";
import ErrorBanner from "../common/ErrorBanner";

export default function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    contactNo: "",
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
      const response = await api.get("/staff/profile");
      setProfile(response.data);
      setFormData({
        email: response.data.email || "",
        contactNo: response.data.contactNo || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate passwords if provided
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError("Current password is required to set a new password");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }
      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
    }

    try {
      const updateData = {
        email: formData.email,
        contactNo: formData.contactNo
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await api.put("/staff/profile", updateData);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
      loadProfile();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#2d3b2b]">Staff Profile</h2>
        <p className="text-sm text-gray-600 mt-1">View and manage your account settings</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-white border border-[#b9c8b4] rounded-lg p-6">
            <h3 className="font-semibold text-[#2d3b2b] mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.fullName}
                  disabled
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Contact admin to change your name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#b9c8b4] rounded-lg p-6">
            <h3 className="font-semibold text-[#2d3b2b] mb-4">Change Password (Optional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  minLength={6}
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                loadProfile();
                setError("");
              }}
              className="px-6 py-2 border border-[#b9c8b4] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="bg-white border border-[#b9c8b4] rounded-lg p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#2d3b2b]">Personal Information</h3>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
              >
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <p className="font-medium text-[#2d3b2b]">{profile?.fullName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Position</label>
                <p className="font-medium text-[#2d3b2b]">{profile?.position}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-[#2d3b2b]">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Contact Number</label>
                <p className="font-medium text-[#2d3b2b]">{profile?.contactNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Username</label>
                <p className="font-medium text-[#2d3b2b]">{profile?.username}</p>
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
        </>
      )}
    </div>
  );
}

