import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import HealthCardPreviewModal from "../../components/staff/HealthCardPreviewModal";

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/patients", {
        params: { search, limit: 100 },
      });
      setPatients(response.data.patients);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewCard = (patient) => {
    setSelectedPatient(patient);
  };

  const handleViewDetails = (patientId) => {
    navigate(`/staff/records/${patientId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#2d3b2b]">
          Registered Patients
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          View and manage all registered patients
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, or NIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
        />
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg h-20 animate-pulse"
            ></div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState message="No patients found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f0f5ef]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  NIC
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  Registered
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b9c8b4]">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-[#f0f5ef] transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {patient.name}
                  </td>
                  <td className="px-4 py-3 text-sm">{patient.nic}</td>
                  <td className="px-4 py-3 text-sm">{patient.phone}</td>
                  <td className="px-4 py-3 text-sm">{patient.email}</td>
                  <td className="px-4 py-3 text-sm">{patient.gender}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(patient.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCard(patient)}
                        className="px-3 py-1 bg-[#7e957a] text-white text-sm rounded hover:bg-[#6e8a69] transition-colors"
                      >
                        View Card
                      </button>
                      <button
                        onClick={() => handleViewDetails(patient.id)}
                        className="px-3 py-1 bg-[#6e8a69] text-white text-sm rounded hover:bg-[#5f7a5a] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Health Card Modal */}
      {selectedPatient && (
        <HealthCardPreviewModal
          open={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          patientId={selectedPatient.id}
        />
      )}
    </div>
  );
}
