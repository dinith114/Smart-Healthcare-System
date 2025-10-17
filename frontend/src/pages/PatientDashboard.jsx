import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getDemoHeaders } from "../services/api";
import Calendar from "../components/dashboard/Calendar.jsx";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments.jsx";
import PatientInfoCard from "../components/dashboard/PatientInfoCard.jsx";
import DashboardButtons from "../components/dashboard/DashboardButtons.jsx";

// Modals
import MedicalInfoModal from "../components/dashboard/modals/MedicalInfoModal.jsx";
import VitalStatusModal from "../components/dashboard/modals/VitalStatusModal.jsx";
import VisitHistoryModal from "../components/dashboard/modals/VisitHistoryModal.jsx";
import PaymentHistoryModal from "../components/dashboard/modals/PaymentHistoryModal.jsx";

export default function PatientDashboard({ patientId }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showMedical, setShowMedical] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showVisits, setShowVisits] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const load = async () => {
    setLoading(true);
    try {
      const demoHeaders = getDemoHeaders();
      const [sRes, aRes] = await Promise.all([
        api.get(`/patients/${patientId}/summary`, { headers: demoHeaders }),
        api
          .get(`/appointments/get-appointment`, { params: { patientId } })
          .catch(() => ({ data: [] })), // safe fallback
      ]);
      setSummary(sRes.data);
      setAppointments(aRes.data || []);
    } catch (error) {
      console.error("Error loading patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [patientId]);

  // optimistic refresh after avatar upload
  const onAvatarChanged = (urlFromServer) => {
    setSummary((s) =>
      s
        ? {
            ...s,
            patient: {
              ...s.patient,
              avatarUrl: urlFromServer || s.patient?.avatarUrl,
            },
          }
        : s
    );
  };

  return (
    <div className="min-h-screen bg-[#8aa082]/30">
      {/* top bar */}
      <header className="bg-[#7e957a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20" />
            <span className="font-semibold">Smart Healthcare</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => navigate("/patient")}
              className="hover:underline transition-all"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/patient/about")}
              className="hover:underline transition-all"
            >
              About
            </button>
            <button
              onClick={() => navigate("/patient/appointments")}
              className="hover:underline transition-all"
            >
              Appointments
            </button>
            <button
              onClick={() => navigate("/patient/payments")}
              className="hover:underline transition-all"
            >
              Payments
            </button>
          </nav>
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-full bg-[#5b6f59] hover:bg-[#4f614e]"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/patient")}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-[#b9c8b4] text-[#2d3b2b] rounded-lg hover:bg-[#f0f5ef] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Portal
          </button>
          <h2 className="text-2xl font-semibold text-[#2d3b2b]">
            Patient Dashboard
          </h2>
        </div>

        {/* layout */}
        <div className="grid grid-cols-12 gap-5">
          {/* LEFT: calendar + upcoming */}
          <div className="col-span-12 md:col-span-4 space-y-5">
            <Calendar
              appointments={appointments}
              loading={loading}
              className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef]"
            />
            <UpcomingAppointments
              appointments={appointments}
              loading={loading}
              className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-4"
            />
          </div>

          {/* RIGHT: patient info + actions */}
          <div className="col-span-12 md:col-span-8">
            <PatientInfoCard
              data={summary?.patient}
              className="rounded-2xl border border-[#b9c8b4] bg-[#f0f5ef] p-5"
              patientId={patientId}
              onAvatarChanged={onAvatarChanged}
            />

            <DashboardButtons
              onMedical={() => setShowMedical(true)}
              onVitals={() => setShowVitals(true)}
              onVisits={() => setShowVisits(true)}
              onPayments={() => setShowPayments(true)}
            />
          </div>
        </div>
      </main>

      {/* MODALS */}
      <MedicalInfoModal
        open={showMedical}
        onClose={() => setShowMedical(false)}
        summary={summary}
      />
      <VitalStatusModal
        open={showVitals}
        onClose={() => setShowVitals(false)}
        vitals={summary?.vitals}
      />
      <VisitHistoryModal
        open={showVisits}
        onClose={() => setShowVisits(false)}
        visits={summary?.visits || []}
      />
      <PaymentHistoryModal
        open={showPayments}
        onClose={() => setShowPayments(false)}
        patientId={patientId}
      />
    </div>
  );
}
