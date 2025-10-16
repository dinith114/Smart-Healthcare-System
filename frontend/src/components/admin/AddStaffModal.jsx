import { useState, useEffect } from "react";
import { api } from "../../services/api";
import Modal from "../common/Modal";

export default function AddStaffModal({ open, onClose, onSuccess, staff }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNo: "",
    position: "",
    username: ""
  });
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionTitle, setNewPositionTitle] = useState("");

  useEffect(() => {
    if (open) {
      loadPositions();
    }
    
    if (staff) {
      setFormData({
        fullName: staff.fullName || "",
        email: staff.email || "",
        contactNo: staff.contactNo || "",
        position: staff.position || "",
        username: staff.username || ""
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        contactNo: "",
        position: "",
        username: ""
      });
    }
    setError("");
    setTempPassword("");
    setShowAddPosition(false);
    setNewPositionTitle("");
  }, [staff, open]);

  const loadPositions = async () => {
    try {
      const response = await api.get("/admin/positions");
      setPositions(response.data.positions);
    } catch (err) {
      console.error("Error loading positions:", err);
    }
  };

  const handleAddPosition = async () => {
    if (!newPositionTitle.trim()) return;
    
    try {
      await api.post("/admin/positions", { title: newPositionTitle.trim() });
      await loadPositions();
      setFormData({ ...formData, position: newPositionTitle.trim() });
      setShowAddPosition(false);
      setNewPositionTitle("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add position");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (staff) {
        // Update existing staff
        await api.put(`/admin/staff/${staff.id}`, formData);
        onSuccess();
      } else {
        // Add new staff
        const response = await api.post("/admin/staff", formData);
        setTempPassword(response.data.staff.temporaryPassword);
        // Don't close modal immediately, show password first
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save staff");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (tempPassword) {
      // New staff was created, refresh the list
      onSuccess();
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#2d3b2b] mb-4">
          {staff ? "Edit Staff Member" : "Add New Staff Member"}
        </h2>

        {tempPassword ? (
          // Show temporary password after successful creation
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">✓ Staff member created successfully!</p>
              <p className="text-sm text-green-700">Share these credentials with the new staff member:</p>
            </div>

            <div className="bg-white border-2 border-[#7e957a] rounded-lg p-4 space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-600">Username:</label>
                <p className="text-lg font-semibold text-[#2d3b2b]">{formData.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Temporary Password:</label>
                <p className="text-lg font-semibold text-[#7e957a]">{tempPassword}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              ⚠️ Please save this password. It will not be shown again. The staff member should change it after first login.
            </p>

            <button
              onClick={handleClose}
              className="w-full py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          // Show form
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Email *
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
                Contact Number *
              </label>
              <input
                type="tel"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Position *
              </label>
              {showAddPosition ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPositionTitle}
                    onChange={(e) => setNewPositionTitle(e.target.value)}
                    placeholder="Enter new position title"
                    className="flex-1 px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPosition())}
                  />
                  <button
                    type="button"
                    onClick={handleAddPosition}
                    className="px-4 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPosition(false)}
                    className="px-4 py-2 border border-[#b9c8b4] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="flex-1 px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                  >
                    <option value="">Select a position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddPosition(true)}
                    className="px-4 py-2 border border-[#7e957a] text-[#7e957a] rounded-lg hover:bg-[#7e957a] hover:text-white transition-colors flex items-center gap-1"
                    title="Add new position"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New
                  </button>
                </div>
              )}
            </div>

            {!staff && (
              <div>
                <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                  Username (for login) *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="e.g., staff.john"
                  className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A temporary password will be generated automatically
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
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
                {loading ? "Saving..." : staff ? "Update" : "Add Staff"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

