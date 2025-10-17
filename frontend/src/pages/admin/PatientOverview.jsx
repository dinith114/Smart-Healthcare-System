import { useState, useEffect } from "react";
import { api } from "../../services/api";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";

export default function PatientOverview() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newMobile, setNewMobile] = useState("");
  const [changingMobile, setChangingMobile] = useState(false);
  const [mobileChangeResult, setMobileChangeResult] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusPatient, setStatusPatient] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/patients", {
        params: { search, limit: 100 }
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

  const handleChangeMobileClick = (patient) => {
    setSelectedPatient(patient);
    setNewMobile("");
    setError("");
    setMobileChangeResult(null);
  };

  const handleChangeMobile = async (e) => {
    e.preventDefault();
    setError("");
    setChangingMobile(true);

    try {
      const response = await api.put(`/admin/patients/${selectedPatient.id}/change-mobile`, {
        newMobile
      });
      setMobileChangeResult(response.data);
      loadPatients(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change mobile number");
    } finally {
      setChangingMobile(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setNewMobile("");
    setMobileChangeResult(null);
    setError("");
  };

  const handleChangeStatusClick = (patient) => {
    setStatusPatient(patient);
    setShowStatusModal(true);
    setError("");
  };

  const handleChangeStatus = async (newStatus) => {
    setError("");
    setUpdatingStatus(true);

    try {
      await api.put(`/admin/patients/${statusPatient.id}/status`, {
        status: newStatus
      });
      setShowStatusModal(false);
      setStatusPatient(null);
      loadPatients(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update patient status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#2d3b2b]">Patient Overview</h2>
        <p className="text-sm text-gray-600 mt-1">
          View all registered patients in the system
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
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse"></div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState message="No patients found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f0f5ef]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">NIC</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Gender</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Registered By</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[#2d3b2b]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b9c8b4]">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-[#f0f5ef] transition-colors">
                  <td className="px-4 py-3 text-sm">{patient.name}</td>
                  <td className="px-4 py-3 text-sm">{patient.nic}</td>
                  <td className="px-4 py-3 text-sm">{patient.phone}</td>
                  <td className="px-4 py-3 text-sm">{patient.email}</td>
                  <td className="px-4 py-3 text-sm">{patient.gender}</td>
                  <td className="px-4 py-3 text-sm">{patient.registeredBy || "-"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(patient.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.status === "ACTIVE" 
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {patient.status === "ACTIVE" && (
                        <button
                          onClick={() => handleChangeMobileClick(patient)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Change mobile number"
                        >
                          Change Mobile
                        </button>
                      )}
                      <button
                        onClick={() => handleChangeStatusClick(patient)}
                        className={`text-xs px-3 py-1 rounded transition-colors ${
                          patient.status === "ACTIVE"
                            ? "bg-gray-600 text-white hover:bg-gray-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                        title="Change status"
                      >
                        {patient.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Mobile Modal */}
      {selectedPatient && (
        <Modal open={!!selectedPatient} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#2d3b2b] mb-4">
              Change Patient Mobile Number
            </h2>

            {mobileChangeResult ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">✓ Mobile number changed successfully!</p>
                  <p className="text-sm text-green-700">New credentials have been sent to the patient's email.</p>
                </div>

                <div className="bg-white border-2 border-[#7e957a] rounded-lg p-4">
                  <h3 className="font-semibold text-[#2d3b2b] mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {mobileChangeResult.patient.name}</p>
                    <p><span className="font-medium">Old Mobile:</span> <span className="line-through text-gray-500">{mobileChangeResult.patient.oldMobile}</span></p>
                    <p><span className="font-medium">New Mobile:</span> <span className="text-[#7e957a] font-bold">{mobileChangeResult.patient.newMobile}</span></p>
                    <p><span className="font-medium">Email:</span> {mobileChangeResult.patient.email}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">New Credentials</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Username:</span> {mobileChangeResult.newCredentials.username}</p>
                    <p><span className="font-medium">Password:</span> <span className="text-lg font-bold text-blue-700">{mobileChangeResult.newCredentials.password}</span></p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangeMobile} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Warning:</strong> This will create a new account with a new password. The old account will be deactivated. Patient details and health card will remain unchanged.
                  </p>
                </div>

                <div className="bg-[#f0f5ef] rounded-lg p-4">
                  <p className="text-sm mb-2"><strong>Patient:</strong> {selectedPatient.name}</p>
                  <p className="text-sm mb-2"><strong>Current Mobile:</strong> {selectedPatient.phone}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedPatient.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
                    New Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    required
                    placeholder="Enter new mobile number"
                    className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will become the new username for the patient
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-2 border border-[#b9c8b4] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={changingMobile}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors disabled:opacity-50"
                    disabled={changingMobile}
                  >
                    {changingMobile ? "Changing..." : "Change Mobile Number"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}

      {/* Change Status Modal */}
      {showStatusModal && statusPatient && (
        <Modal open={showStatusModal} onClose={() => !updatingStatus && setShowStatusModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#2d3b2b] mb-4">
              Change Patient Status
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="bg-[#f0f5ef] rounded-lg p-4 mb-4">
              <p className="text-sm mb-2"><strong>Patient:</strong> {statusPatient.name}</p>
              <p className="text-sm mb-2"><strong>NIC:</strong> {statusPatient.nic}</p>
              <p className="text-sm mb-2"><strong>Current Status:</strong> <span className={`px-2 py-1 text-xs rounded-full ${
                statusPatient.status === "ACTIVE" 
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>{statusPatient.status}</span></p>
            </div>

            <div className={`border rounded-lg p-4 mb-4 ${
              statusPatient.status === "ACTIVE" 
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}>
              <p className={`text-sm ${
                statusPatient.status === "ACTIVE" 
                  ? "text-red-800"
                  : "text-green-800"
              }`}>
                {statusPatient.status === "ACTIVE" ? (
                  <>
                    <strong>⚠️ Warning:</strong> Deactivating this patient will:
                    <ul className="list-disc ml-5 mt-2">
                      <li>Prevent them from logging into their account</li>
                      <li>Make their health card inactive</li>
                      <li>Keep all their medical records and history</li>
                    </ul>
                    <p className="mt-2">This action can be reversed by reactivating the patient.</p>
                  </>
                ) : (
                  <>
                    <strong>✓ Activating:</strong> This will restore the patient's access to:
                    <ul className="list-disc ml-5 mt-2">
                      <li>Login to their account</li>
                      <li>View their health card</li>
                      <li>Access their medical records</li>
                    </ul>
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-2 border border-[#b9c8b4] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                onClick={() => handleChangeStatus(statusPatient.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                className={`flex-1 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  statusPatient.status === "ACTIVE"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : (statusPatient.status === "ACTIVE" ? "Deactivate Patient" : "Activate Patient")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

