import { useState, useEffect } from "react";
import { api } from "../../services/api";
import Modal from "../common/Modal";

export default function HealthCardPreviewModal({ open, onClose, patientId }) {
  const [healthCard, setHealthCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && patientId) {
      loadHealthCard();
    }
  }, [open, patientId]);

  const loadHealthCard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/patients/${patientId}/health-card`);
      setHealthCard(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load health card");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#2d3b2b] mb-6 text-center no-print">
          Digital Health Card
        </h2>

        {loading ? (
          <div className="flex justify-center py-12 no-print">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7e957a]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg no-print">
            {error}
          </div>
        ) : healthCard ? (
          <>
            {/* Health Card Design - Printable */}
            <div className="print-card bg-gradient-to-br from-[#7e957a] to-[#6e8a69] rounded-2xl p-6 text-white mb-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium opacity-80">Smart Healthcare System</h3>
                  <p className="text-2xl font-bold mt-1">{healthCard.patient?.name}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs opacity-70">Card Number</p>
                  <p className="font-semibold">{healthCard.cardNumber}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">NIC</p>
                  <p className="font-semibold">{healthCard.patient?.nic}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Issued Date</p>
                  <p className="font-semibold">{formatDate(healthCard.issuedDate)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Status</p>
                  <p className="font-semibold">{healthCard.status}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-lg p-3 flex justify-center">
                <img 
                  src={healthCard.qrCodeImage} 
                  alt="QR Code" 
                  className="w-40 h-40"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#f0f5ef] rounded-lg p-4 mb-6 no-print">
              <h4 className="font-semibold text-[#2d3b2b] mb-2">Patient Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{healthCard.patient?.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{healthCard.patient?.email}</span>
                </div>
              </div>
              {healthCard.lastScanned && (
                <div className="mt-2 text-xs text-gray-600">
                  Last scanned: {formatDate(healthCard.lastScanned)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 no-print">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 border border-[#7e957a] text-[#7e957a] rounded-lg hover:bg-[#7e957a] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Card
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}

