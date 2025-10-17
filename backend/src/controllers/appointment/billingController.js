// backend/src/controllers/appointment/billingController.js
const User = require("../../models/userModel");
const Staff = require("../../models/Staff"); // NB: match your file name/case exactly
const { getFeeForSpecialty } = require("../../services/appointment/pricingServices");

exports.getQuote = async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({ message: "doctorId is required" });
    }

    // Load the user behind the selected "doctor"
    const user = await User.findById(doctorId).select("_id username role status");
    if (!user || user.status === "INACTIVE") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Pull the staff profile (where position/specialty live)
    const staff = await Staff.findOne({ userId: user._id }).select("position specialty");
    const isDoctor =
      user.role === "doctor" || (user.role === "staff" && staff?.position?.toLowerCase() === "doctor");

    if (!isDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const specialty = staff?.specialty || "General";
    const amount = getFeeForSpecialty(specialty);

    return res.json({
      doctorId: user._id.toString(),
      doctorName: user.username,
      specialty,
      position: staff?.position || "Doctor",
      amount,
      currency: "LKR",
    });
  } catch (e) {
    console.error("getQuote error:", e);
    return res.status(500).json({ message: "Failed to fetch quote" });
  }
};
