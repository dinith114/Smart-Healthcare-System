// src/components/records/ActionPanel.jsx
export default function ActionPanel({
  canEdit = false,
  editMode = false,
  onEdit,
  onSave,
  onCancel,
  onAdd,
  onViewOldRecords,
}) {
  return (
    <div className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-3">
      {/* image placeholder */}
      <div className="h-44 w-full overflow-hidden rounded-lg mb-3">
        <img
          src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1640&auto=format&fit=crop"
          alt="care"
          className="w-full h-full object-cover"
        />
      </div>

      {/* buttons (provider only) */}
      {canEdit ? (
        <>
          {!editMode ? (
            <>
              <button
                onClick={onEdit}
                className="w-full mb-2 rounded-lg bg-[#6e8a69] text-white py-2 hover:bg-[#5f7a5a]"
              >
                Update Record
              </button>
              <button
                onClick={onAdd}
                className="w-full rounded-lg bg-[#8da689] text-white/95 py-2 hover:bg-[#7c9578]"
              >
                Add Report
              </button>
              <button
                onClick={onViewOldRecords}
                className="w-full mt-2 rounded-lg bg-[#9db598] text-white/95 py-2 hover:bg-[#8da689]"
              >
                View Old Records
              </button>
              <button
                disabled
                className="w-full mt-2 rounded-lg border border-[#a8b9a3] bg-white/70 py-2 cursor-not-allowed"
              >
                Schedule Follow-up
              </button>
            </>
          ) : (
            <>
              <div className="mb-2 text-sm text-slate-700">
                Edit mode is ON. Use ✎ fields and then save.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onSave}
                  className="flex-1 rounded-lg bg-green-700 text-white py-2 hover:bg-green-800"
                >
                  Save Changes
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-lg border border-[#a8b9a3] bg-white py-2"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-sm text-slate-600">Read-only access</div>
      )}
    </div>
  );
}
