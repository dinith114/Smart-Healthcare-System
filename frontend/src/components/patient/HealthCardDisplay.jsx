export default function HealthCardDisplay({ healthCard, patientName }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDownload = () => {
    if (healthCard?.qrCodeImage) {
      const link = document.createElement('a');
      link.href = healthCard.qrCodeImage;
      link.download = `health-card-${healthCard.cardNumber}.png`;
      link.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!healthCard) {
    return (
      <div className="bg-white rounded-2xl border border-[#b9c8b4] p-6">
        <h2 className="text-xl font-semibold text-[#2d3b2b] mb-4">
          Digital Health Card
        </h2>
        <div className="text-center text-gray-500 py-8">
          Loading health card...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#b9c8b4] p-6">
      <h2 className="text-xl font-semibold text-[#2d3b2b] mb-4 no-print">
        Digital Health Card
      </h2>

      {/* Card Design - Printable */}
      <div className="print-card bg-gradient-to-br from-[#7e957a] to-[#6e8a69] rounded-xl p-5 text-white mb-4 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xs font-medium opacity-80">Smart Healthcare</h3>
            <p className="text-lg font-bold mt-1">{patientName || healthCard.patientName}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2 mb-3 text-sm">
          <div>
            <p className="text-xs opacity-70">Card Number</p>
            <p className="font-semibold">{healthCard.cardNumber}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Issued Date</p>
            <p className="font-semibold">{formatDate(healthCard.issuedDate)}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg p-2 flex justify-center">
          <img 
            src={healthCard.qrCodeImage} 
            alt="Health Card QR Code" 
            className="w-32 h-32"
          />
        </div>

        <p className="text-center text-xs mt-2 opacity-80">
          Scan for verification
        </p>
      </div>

      {/* Status Info */}
      <div className="bg-[#f0f5ef] rounded-lg p-3 mb-4 no-print">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            healthCard.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {healthCard.status}
          </span>
        </div>
        {healthCard.lastScanned && (
          <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
            <span>Last Scanned:</span>
            <span>{formatDate(healthCard.lastScanned)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 no-print">
        <button
          onClick={handleDownload}
          className="w-full py-2 border border-[#7e957a] text-[#7e957a] rounded-lg hover:bg-[#7e957a] hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Card
        </button>
        <button
          onClick={handlePrint}
          className="w-full py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Card
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4 no-print">
        Keep your health card safe and accessible
      </p>
    </div>
  );
}

