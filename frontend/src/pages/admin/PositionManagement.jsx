import { useState, useEffect } from "react";
import { api } from "../../services/api";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";

export default function PositionManagement() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPosition, setNewPosition] = useState({ title: "", description: "" });
  const [editingPosition, setEditingPosition] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/positions");
      setPositions(response.data.positions);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load positions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosition = async (e) => {
    e.preventDefault();
    if (!newPosition.title.trim()) return;

    try {
      await api.post("/admin/positions", newPosition);
      setNewPosition({ title: "", description: "" });
      setShowAddForm(false);
      loadPositions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add position");
    }
  };

  const handleEditPosition = async (e) => {
    e.preventDefault();
    if (!editingPosition) return;

    try {
      await api.put(`/admin/positions/${editingPosition.id}`, {
        title: editingPosition.title,
        description: editingPosition.description
      });
      setEditingPosition(null);
      loadPositions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update position");
    }
  };

  const handleDeletePosition = async (positionId) => {
    if (!confirm("Are you sure you want to delete this position?")) {
      return;
    }

    try {
      await api.delete(`/admin/positions/${positionId}`);
      loadPositions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete position");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2d3b2b]">Position Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage staff positions available in the system
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors flex items-center gap-2"
        >
          {showAddForm ? (
            <>Cancel</>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Position
            </>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {/* Add Position Form */}
      {showAddForm && (
        <div className="bg-[#f0f5ef] rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-[#2d3b2b] mb-3">Add New Position</h3>
          <form onSubmit={handleAddPosition} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Position Title *
              </label>
              <input
                type="text"
                value={newPosition.title}
                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                required
                placeholder="e.g., Nurse, Receptionist, Lab Technician"
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newPosition.description}
                onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                rows={2}
                placeholder="Brief description of the position"
                className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
            >
              Add Position
            </button>
          </form>
        </div>
      )}

      {/* Positions List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse"></div>
          ))}
        </div>
      ) : positions.length === 0 ? (
        <EmptyState message="No positions found. Add your first position above." />
      ) : (
        <div className="space-y-3">
          {positions.map((position) => (
            <div
              key={position.id}
              className="bg-white border border-[#b9c8b4] rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {editingPosition?.id === position.id ? (
                <form onSubmit={handleEditPosition} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={editingPosition.title}
                      onChange={(e) => setEditingPosition({ ...editingPosition, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                    />
                  </div>
                  <div>
                    <textarea
                      value={editingPosition.description || ""}
                      onChange={(e) => setEditingPosition({ ...editingPosition, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#7e957a] text-white rounded hover:bg-[#6e8a69] transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPosition(null)}
                      className="px-4 py-1.5 border border-[#b9c8b4] text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#2d3b2b] text-lg">{position.title}</h3>
                    {position.description && (
                      <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Added on {formatDate(position.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingPosition(position)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePosition(position.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

