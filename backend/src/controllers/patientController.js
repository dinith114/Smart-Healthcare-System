const User = require("../models/userModel");
const Patient = require("../models/Patient");
const HealthCard = require("../models/HealthCard");

/**
 * Get patient's own profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId })
      .populate("userId", "username status")
      .populate("registeredBy", "fullName position");

    if (!patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    res.json({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      nic: patient.nic,
      dob: patient.dob,
      gender: patient.gender,
      address: patient.address,
      status: patient.status,
      avatarUrl: patient.avatarUrl,
      username: patient.userId?.username,
      registeredDate: patient.createdAt,
      registeredBy: patient.registeredBy
        ? {
            name: patient.registeredBy.fullName,
            position: patient.registeredBy.position,
          }
        : null,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * Get patient's health card with QR code
 */
exports.getHealthCard = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const healthCard = await HealthCard.findOne({ patientId: patient._id });
    if (!healthCard) {
      return res.status(404).json({ message: "Health card not found" });
    }

    res.json({
      cardNumber: healthCard.cardNumber,
      patientName: patient.name,
      patientNIC: patient.nic,
      issuedDate: healthCard.issuedDate,
      status: healthCard.status,
      qrCodeImage: healthCard.qrCodeImage,
      lastScanned: healthCard.lastScanned,
    });
  } catch (error) {
    console.error("Get health card error:", error);
    res.status(500).json({ message: "Failed to fetch health card" });
  }
};

/**
 * Update patient's own profile (limited fields)
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, address, password } = req.body;

    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update allowed fields
    if (email && email !== patient.email) {
      const existing = await Patient.findOne({
        email,
        _id: { $ne: patient._id },
      });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      patient.email = email;
    }

    if (address) {
      patient.address = address;
    }

    await patient.save();

    // Update password if provided
    if (password) {
      const user = await User.findById(userId);
      if (user) {
        await user.setPassword(password);
        await user.save();
      }
    }

    res.json({
      message: "Profile updated successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        address: patient.address,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
