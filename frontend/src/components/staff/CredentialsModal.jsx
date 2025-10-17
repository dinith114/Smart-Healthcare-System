import { AnimatePresence, motion } from "framer-motion";

export default function CredentialsModal({ open, onClose, data }) {
  const { patient, credentials, healthCard } = data || {};

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const handleDownload = () => {
    // Create a printable version for download
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      const htmlContent = `
        <html>
          <head>
            <title>Digital Health Card - ${patient?.name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                max-width: 600px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .qr-code {
                text-align: center;
                margin: 20px 0;
              }
              .qr-code img {
                width: 200px;
                height: 200px;
              }
              .qr-text {
                margin-top: 10px;
                font-size: 12px;
                color: #666;
              }
              .info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
              }
              .info-item {
                margin-bottom: 10px;
              }
              .label {
                font-size: 12px;
                color: #666;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .value {
                font-size: 14px;
                color: #333;
              }
              @media print {
                body { background: white; }
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1>Digital Health Card</h1>
                <p>Patient ID: ${healthCard?.cardNumber || 'N/A'}</p>
              </div>
              <div class="qr-code">
                ${healthCard?.qrCodeImage ? `<img src="${healthCard.qrCodeImage}" alt="QR Code" />` : ''}
                <p class="qr-text">Scan this QR code for quick access to health information</p>
              </div>
              <div class="info">
                <div class="info-item">
                  <div class="label">Name</div>
                  <div class="value">${patient?.name || 'N/A'}</div>
                </div>
                <div class="info-item">
                  <div class="label">Date of Birth</div>
                  <div class="value">${formatDate(patient?.dob)}</div>
                </div>
                <div class="info-item">
                  <div class="label">Blood Type</div>
                  <div class="value">O+</div>
                </div>
                <div class="info-item">
                  <div class="label">Expiry Date</div>
                  <div class="value">${formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 5)))}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRequestPhysical = () => {
    // Print the health card
    handleDownload();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-[#b8cbb3] rounded-2xl p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
              >
                <svg className="w-5 h-5 text-[#2d3b2b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#5b6f59] flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#2d3b2b] mb-2">
            Digital Health Card Issued
          </h2>
          <p className="text-sm text-[#2d3b2b]">
            Your digital health card has been successfully created and is ready for use.
          </p>
        </div>

        {/* Health Card Display */}
        <div className="bg-[#c8d5c0] rounded-2xl p-6 mb-4 shadow-md">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
            <div>
              <h3 className="font-bold text-[#2d3b2b] text-lg">Digital Health Card</h3>
              <p className="text-xs text-gray-600">Patient ID: {healthCard?.cardNumber}</p>
            </div>
            <svg className="w-8 h-8 text-[#5b6f59]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
            </svg>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl border border-gray-300">
              {healthCard?.qrCodeImage ? (
                <img 
                  src={healthCard.qrCodeImage} 
                  alt="QR Code" 
                  className="w-40 h-40"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-sm">QR Code</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-gray-600 mb-4">
            Scan this QR code for quick access to your health information
          </p>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-600 font-semibold">Name</p>
              <p className="text-[#2d3b2b] font-medium">{patient?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Date of Birth</p>
              <p className="text-[#2d3b2b] font-medium">{formatDate(patient?.dob)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Blood Type</p>
              <p className="text-[#2d3b2b] font-medium">O+</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Expiry Date</p>
              <p className="text-[#2d3b2b] font-medium">{formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 5)))}</p>
            </div>
          </div>
        </div>

        {/* Login Credentials Section - Separate */}
        <div className="bg-[#8aa082] rounded-xl p-4 mb-4">
          <h3 className="font-bold text-white text-sm mb-3">Login Credentials</h3>
          <div className="space-y-2">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-xs text-white/90 mb-1">Username (Mobile)</p>
              <p className="text-white font-bold text-lg">{credentials?.username}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-xs text-white/90 mb-1">Password</p>
              <p className="text-white font-bold text-xl tracking-wider">{credentials?.password}</p>
            </div>
          </div>
          <p className="text-xs text-white/90 mt-3">
            ⚠️ Credentials sent to {patient?.email}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={handleDownload}
            className="w-full py-3 bg-[#5b6f59] text-white rounded-lg font-medium hover:bg-[#4f614e] transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Digital Card
          </button>
          <button
            onClick={handleRequestPhysical}
            className="w-full py-3 bg-white text-[#5b6f59] rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border-2 border-[#5b6f59]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Request Physical Card
          </button>
        </div>

        {/* Support Text */}
        <div className="text-center text-xs text-[#2d3b2b]">
          Need help? Contact our support team at{" "}
          <a href="mailto:support@hospital.co" className="text-[#1a4d2e] font-semibold hover:underline">
            support@hospital.co
          </a>
        </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

