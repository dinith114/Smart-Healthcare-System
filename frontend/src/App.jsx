import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PaymentPage from "./pages/payment/PaymentPage.jsx";
import Records from "./pages/Records.jsx"; // Records is .js

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffRecordsView from "./pages/staff/StaffRecordsView";
import PatientPortal from "./pages/patient/PatientPortal";
import PatientDashboardWrapper from "./pages/patient/PatientDashboardWrapper";
import AboutPage from "./pages/patient/AboutPage";
import ContactsPage from "./pages/patient/ContactsPage";
import QRVerification from "./pages/QRVerification";
import HealthCardView from "./pages/HealthCardView";
// import AccessDenied from "./pages/AccessDenied.jsx";

// pages appointment
import AppointmentForm from "./pages/appointment/AppointmentForm";
import AppointmentDetails from "./pages/appointment/AppointmentDetails";
import AppointmentsPage from "./pages/appointment/AppointmentsPage";
import ConfirmAppointment from "./pages/appointment/ConfirmAppointment"; 

const DEMO_PATIENT_ID = "000000000000000000000001";
const ROLE = "Provider";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* QR Verification Routes (Public) */}
              <Route path="/verify-health-card/:token" element={<QRVerification />} />
              <Route path="/view-health-card" element={<HealthCardView />} />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route
                path="/staff/*"
                element={
                  <ProtectedRoute allowedRoles={["staff"]}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/records/:patientId"
                element={
                  <ProtectedRoute allowedRoles={["staff"]}>
                    <StaffRecordsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/payment"
                element={
                  <ProtectedRoute allowedRoles={["staff"]}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />

              {/* Patient Routes */}
              <Route
                path="/patient/*"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientPortal key="patient-portal" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboardWrapper key="patient-dashboard" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/about"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <AboutPage key="about-page" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/contacts"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <ContactsPage key="contacts-page" />
                  </ProtectedRoute>
                }
              />

              {/* Appointment Routes */}
              <Route path="/appointments" element={<AppointmentsPage key="appointments-list" />} />
              <Route path="/appointments/new" element={<AppointmentForm key="appointments-new" />} />
              <Route path="/appointments/:id" element={<AppointmentDetails key="appointments-details" />} />
              <Route path="/appointments/confirm" element={<ConfirmAppointment key="appointments-confirm" />} />

              {/* Payment Routes */}
              <Route path="/payment" element={<PaymentPage />} />

              {/* Medical Records Demo Route (backward compatibility) */}
              <Route
                path="/records"
                element={<Records patientId={DEMO_PATIENT_ID} role={ROLE} />}
              />

              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
