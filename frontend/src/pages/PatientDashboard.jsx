import { useEffect, useState } from "react";
import { api } from "../services/api";
import Calendar from "../components/dashboard/Calendar.jsx";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments.jsx";
import PatientInfoCard from "../components/dashboard/PatientInfoCard.jsx";

import DashboardButtons from "../components/dashboard/DashboardButtons.jsx";
import { useNavigate, Link } from "react-router-dom";

// Modals
import MedicalInfoModal from "../components/dashboard/modals/MedicalInfoModal.jsx";
import VitalStatusModal from "../components/dashboard/modals/VitalStatusModal.jsx";
import VisitHistoryModal from "../components/dashboard/modals/VisitHistoryModal.jsx";
export default function PatientDashboard({ patientId }) {
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showMedical, setShowMedical] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showVisits, setShowVisits] = useState(false);
  // Remove showPayments, navigation will be used instead

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        api.get(`/patients/${patientId}/summary`),
        api
          .get(`/appointments`, { params: { patientId } })
          .catch(() => ({ data: [] })), // safe fallback
      ]);
      setSummary(sRes.data);
      setAppointments(aRes.data || []);
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
            <a className="hover:underline" href="#">
              Home
            </a>
            <a className="hover:underline" href="#">
              About
            </a>
            <a className="hover:underline" href="#">
              Appointments
            </a>
            <Link className="hover:underline" to="/payment">
              Payment
            </Link>
          </nav>
          <button className="px-4 py-1.5 rounded-full bg-[#5b6f59] hover:bg-[#4f614e]">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-2xl font-semibold text-[#2d3b2b] mb-4">
          Patient Dashboard
        </h2>

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
              onPayments={() => navigate("/payment")}
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
      {/* PaymentHistoryModal removed, navigation is used instead */}

    </div>
  );
}
