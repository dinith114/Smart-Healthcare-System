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

    // Log form data for debugging
    console.log("Submitting patient data:", formData);

    try {
      const response = await api.post("/staff/patients", formData);
      console.log("Registration successful:", response.data);
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
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to register patient");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      gender: "Male",
      nic: ""
    });
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form Card with Sage Green Background */}
      <div className="bg-[#a8b9a0] rounded-3xl p-8 shadow-lg">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg 
              className="w-6 h-6 text-[#2d3b2b]" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <h2 className="text-2xl font-bold text-[#2d3b2b]">Patient Registration</h2>
          </div>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm"
              placeholder="Enter full name"
            />
          </div>

          {/* NIC Number */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              NIC Number
            </label>
            <input
              type="text"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm"
              placeholder="123456789V or 200012345678"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm"
              placeholder="patient@example.com"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm resize-none"
              placeholder="Enter full address"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-[#2d3b2b] mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5b6f59] shadow-sm"
              placeholder="0771234567"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#5b6f59] text-white rounded-lg font-medium hover:bg-[#4f614e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-8 py-2.5 bg-white text-[#5b6f59] border-2 border-[#5b6f59] rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          {/* Support Text */}
          <div className="text-center text-sm text-[#2d3b2b] pt-4">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@hospital.co" className="text-[#1a4d2e] font-medium hover:underline">
              support@hospital.co
            </a>
          </div>
        </form>
      </div>

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

