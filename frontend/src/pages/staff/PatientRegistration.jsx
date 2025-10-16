import { useState } from "react";
import { api } from "../../services/api";
import ErrorBanner from "../../components/common/ErrorBanner";
import CredentialsModal from "../../components/staff/CredentialsModal";

export default function PatientRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    gender: "Male",
    nic: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationResult, setRegistrationResult] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/staff/patients", formData);
      setRegistrationResult(response.data);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        gender: "Male",
        nic: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#2d3b2b]">Register New Patient</h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in patient information to create account and generate health card
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              placeholder="Enter full name"
            />
          </div>

          {/* NIC */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
              NIC Number *
            </label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              placeholder="123456789V or 200012345678"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: 9 digits + V or 12 digits
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              placeholder="patient@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
              Mobile Number * (used for login)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
              placeholder="0771234567"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#2d3b2b] mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-[#b9c8b4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e957a]"
            placeholder="Enter full address"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#7e957a] text-white rounded-lg font-semibold hover:bg-[#6e8a69] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Register Patient
              </>
            )}
          </button>
        </div>
      </form>

      {/* Credentials Modal */}
      {registrationResult && (
        <CredentialsModal
          open={!!registrationResult}
          onClose={() => setRegistrationResult(null)}
          data={registrationResult}
        />
      )}
    </div>
  );
}

