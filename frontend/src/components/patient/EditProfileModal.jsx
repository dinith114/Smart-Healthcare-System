import { useState, useEffect } from "react";
import { api } from "../../services/api";
import Modal from "../common/Modal";

export default function EditProfileModal({ open, onClose, profile, onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        email: profile.email || "",
        address: profile.address || "",
        password: "",
        confirmPassword: ""
      });
    }
    setError("");
    setSuccess(false);
  }, [profile, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords if provided
    if (formData.password) {
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    try {
      const updateData = {
        email: formData.email,
        address: formData.address
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      await api.put("/patient/profile", updateData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#2d3b2b] mb-4">
          Edit Profile
        </h2>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-600 text-5xl mb-2">✓</div>
            <p className="text-green-800 font-semibold">Profile updated successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                placeholder="Enter your address"
              />
            </div>

            <div className="pt-4 border-t border-[#b9c8b4]">
              <h3 className="text-sm font-semibold text-[#2d3b2b] mb-3">
                Change Password (Optional)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                    placeholder="Leave blank to keep current"
                  />
                </div>

                {formData.password && (
                  <div>
                    <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                      placeholder="Re-enter new password"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border border-[#b9c8b4] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

