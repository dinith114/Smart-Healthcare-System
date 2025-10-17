import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api";

export default function HealthCardView() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [healthCard, setHealthCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    // Load data from session storage
    const patientData = sessionStorage.getItem("qr-patient-data");
    const healthCardData = sessionStorage.getItem("qr-health-card");
    const sessionToken = sessionStorage.getItem("qr-session-token");

    if (!patientData || !sessionToken) {
      navigate("/");
      return;
    }

    setPatient(JSON.parse(patientData));
    if (healthCardData && healthCardData !== "null") {
      setHealthCard(JSON.parse(healthCardData));
    }
    setLoading(false);

    // Validate session periodically
    const validateInterval = setInterval(async () => {
      try {
        await api.get(`/qr/validate-session?sessionToken=${sessionToken}`);
      } catch (error) {
        setSessionValid(false);
        clearInterval(validateInterval);
        clearInterval(timerInterval);
        setTimeout(() => {
          handleLogout();
        }, 3000);
      }
    }, 60000); // Check every minute

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          clearInterval(validateInterval);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(validateInterval);
      clearInterval(timerInterval);
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("qr-session-token");
    sessionStorage.removeItem("qr-patient-data");
    sessionStorage.removeItem("qr-health-card");
    navigate("/");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7e957a]"></div>
      </div>
    );
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen bg-[#8aa082]/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">Your viewing session has expired for security reasons.</p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#8aa082]/30 py-8 px-4">
      {/* Header with Timer and Logout */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7e957a] rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Secure Session</p>
              <p className="text-lg font-semibold text-gray-800">
                Time Remaining: {formatTime(timeRemaining)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Close
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Health Card Display */}
        {healthCard && (
          <div className="bg-white rounded-2xl border-2 border-[#7e957a] p-8 shadow-xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* QR Code */}
              {healthCard.qrCodeImage && (
                <div className="flex flex-col items-center">
                  <img
                    src={healthCard.qrCodeImage}
                    alt="QR Code"
                    className="w-48 h-48 border-4 border-[#7e957a] rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Scan for quick access
                  </p>
                </div>
              )}

              {/* Card Details */}
              <div className="flex-1">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#2d3b2b] mb-2">
                    Digital Health Card
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-[#7e957a] to-[#5b6f59] rounded"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Card Number</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {healthCard.cardNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issued Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDate(healthCard.issuedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDate(healthCard.expiryDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient Information */}
        <div className="bg-white rounded-2xl border border-[#b9c8b4] p-6 shadow-lg">
          <h3 className="text-xl font-bold text-[#2d3b2b] mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[#7e957a]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-800">{patient.name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">NIC Number</p>
              <p className="text-lg font-semibold text-gray-800">{patient.nic}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(patient.dob)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Gender</p>
              <p className="text-lg font-semibold text-gray-800">{patient.gender}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-800">{patient.email}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="text-lg font-semibold text-gray-800">{patient.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-lg font-semibold text-gray-800">{patient.address}</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold text-yellow-800 mb-1">Security Notice</p>
              <p className="text-sm text-yellow-700">
                This session will automatically close after {formatTime(timeRemaining)} or when you click the Close button. 
                Please do not share this screen with unauthorized persons.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

