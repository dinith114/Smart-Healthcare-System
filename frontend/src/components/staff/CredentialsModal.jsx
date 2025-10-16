import Modal from "../common/Modal";

export default function CredentialsModal({ open, onClose, data }) {
  const { patient, credentials, healthCard } = data || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#2d3b2b]">
            Patient Registered Successfully!
          </h2>
          <p className="text-gray-600 mt-2">
            Patient account created and health card generated
          </p>
        </div>

        {/* Patient Info */}
        <div className="bg-[#f0f5ef] rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-[#2d3b2b] mb-2">Patient Information</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {patient?.name}</p>
            <p><span className="font-medium">NIC:</span> {patient?.nic}</p>
            <p><span className="font-medium">Email:</span> {patient?.email}</p>
            <p><span className="font-medium">Phone:</span> {patient?.phone}</p>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="bg-white border-2 border-[#7e957a] rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-[#2d3b2b] mb-3">Login Credentials</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Username (Mobile):</label>
              <p className="text-lg font-semibold text-[#2d3b2b]">{credentials?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Password:</label>
              <p className="text-2xl font-bold text-[#7e957a] tracking-wider">{credentials?.password}</p>
            </div>
          </div>
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important:</strong> Credentials have been sent to {patient?.email}. 
              Patient should change password after first login.
            </p>
          </div>
        </div>

        {/* Health Card Preview */}
        <div className="bg-white border-2 border-[#b9c8b4] rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-[#2d3b2b] mb-3">Digital Health Card</h3>
          <div className="flex items-center justify-center mb-2">
            {healthCard?.qrCodeImage && (
              <img 
                src={healthCard.qrCodeImage} 
                alt="Health Card QR Code" 
                className="w-48 h-48 border border-[#b9c8b4] rounded-lg"
              />
            )}
          </div>
          <p className="text-center text-sm font-medium text-[#2d3b2b]">
            Card Number: <span className="text-[#7e957a]">{healthCard?.cardNumber}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 border border-[#7e957a] text-[#7e957a] rounded-lg hover:bg-[#7e957a] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-[#7e957a] text-white rounded-lg hover:bg-[#6e8a69] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

