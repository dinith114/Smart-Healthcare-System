import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useToastContext } from "../../context/ToastContext";
import StaffTable from "../../components/admin/StaffTable";
import AddStaffModal from "../../components/admin/AddStaffModal";
import ErrorBanner from "../../components/common/ErrorBanner";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function StaffManagement({ onStaffChange }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, staffId: null, staffName: "" });
  const { showToast } = useToastContext();

  useEffect(() => {
    loadStaff();
  }, [search]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/staff", {
        params: { search, limit: 100 }
      });
      setStaff(response.data.staff);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setShowAddModal(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setShowAddModal(true);
  };

  const handleDeleteStaff = (staffMember) => {
    setDeleteConfirm({
      open: true,
      staffId: staffMember.id,
      staffName: staffMember.fullName
    });
  };

  const confirmDeleteStaff = async () => {
    try {
      await api.delete(`/admin/staff/${deleteConfirm.staffId}`);
      showToast("Staff member deactivated successfully", "success");
      loadStaff();
      onStaffChange?.();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to deactivate staff";
      showToast(errorMsg, "error");
    } finally {
      setDeleteConfirm({ open: false, staffId: null, staffName: "" });
    }
  };

  const handleStaffSaved = () => {
    setShowAddModal(false);
    setEditingStaff(null);
    loadStaff();
    onStaffChange?.();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2d3b2b]">Staff Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage hospital staff accounts and permissions
          </p>
        </div>
        <button
          onClick={handleAddStaff}
          className="px-4 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Staff
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
        />
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {/* Staff Table */}
      <StaffTable
        staff={staff}
        loading={loading}
        onEdit={handleEditStaff}
        onDelete={handleDeleteStaff}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddStaffModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingStaff(null);
          }}
          onSuccess={handleStaffSaved}
          staff={editingStaff}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        type="danger"
        title="Deactivate Staff Member?"
        message={`Are you sure you want to deactivate ${deleteConfirm.staffName}? They will no longer be able to access the system.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        onConfirm={confirmDeleteStaff}
        onCancel={() => setDeleteConfirm({ open: false, staffId: null, staffName: "" })}
      />
    </div>
  );
}

