// backend/src/controllers/billingController.js
const User = require("../../models/userModel"); // adjust if your path differs
const { getFeeForSpecialty } = require("../../services/appointment/pricingServices");

exports.getQuote = async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ message: "doctorId is required" });

    const doctor = await User.findById(doctorId).select("username specialty role");
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const specialty = doctor.specialty || "General";
    const amount = getFeeForSpecialty(specialty);

    return res.json({
      doctorId,
      doctorName: doctor.username,
      specialty,
      amount, // in Rs.
      currency: "LKR",
    });
  } catch (e) {
    console.error("getQuote error:", e);
    return res.status(500).json({ message: "Failed to fetch quote" });
  }
};
