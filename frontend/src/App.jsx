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
import PatientPortal from "./pages/patient/PatientPortal";

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
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Patient Routes */}
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientPortal />
              </ProtectedRoute>
            } 
          />

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
