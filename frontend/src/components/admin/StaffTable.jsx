import EmptyState from "../common/EmptyState";

export default function StaffTable({ staff, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (staff.length === 0) {
    return <EmptyState message="No staff members found" />;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#f0f5ef]">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Full Name</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Username</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Contact</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Position</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Created</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#b9c8b4]">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-[#f0f5ef] transition-colors">
              <td className="px-4 py-3 text-sm font-medium">{member.fullName}</td>
              <td className="px-4 py-3 text-sm">{member.username}</td>
              <td className="px-4 py-3 text-sm">{member.email}</td>
              <td className="px-4 py-3 text-sm">{member.contactNo}</td>
              <td className="px-4 py-3 text-sm">{member.position}</td>
              <td className="px-4 py-3 text-sm">{formatDate(member.createdAt)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  member.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {member.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(member)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {member.status === "ACTIVE" && (
                    <button
                      onClick={() => onDelete(member)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Deactivate"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

