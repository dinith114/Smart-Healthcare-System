import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import PatientDashboard from "../PatientDashboard";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

export default function PatientDashboardWrapper() {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientId = async () => {
      try {
        // Fetch patient profile to get the patient ID
        const response = await api.get("/patient/profile");
        setPatientId(response.data.id || response.data._id);
      } catch (error) {
        console.error("Error fetching patient ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientId();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center">
        <LoadingSkeleton lines={8} />
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Unable to load patient information</p>
        </div>
      </div>
    );
  }

  return <PatientDashboard patientId={patientId} />;
}
