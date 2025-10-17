const User = require("../models/userModel");
const Patient = require("../models/Patient");
const Staff = require("../models/Staff");
const HealthCard = require("../models/HealthCard");
const { generatePassword } = require("../utils/passwordGenerator");
const { validateNIC } = require("../utils/nicValidator");
const { generateCardNumber } = require("../utils/cardNumberGenerator");
const { generateQRCode } = require("../services/qrService");
const { sendPatientCredentials } = require("../services/emailService");

/**
 * Register new patient
 */
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, phone, dob, address, gender, nic } = req.body;

    const staffUserId = req.user.id;

    // Validation
    if (!name || !email || !phone || !nic || !dob || !gender) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // Validate NIC format
    if (!validateNIC(nic)) {
      return res.status(400).json({
        message: "Invalid NIC format. Use format: 123456789V or 200012345678",
      });
    }

    // Check if NIC already exists
    const existingNIC = await Patient.findOne({
      nic: nic.trim().toUpperCase(),
    });
    if (existingNIC) {
      return res
        .status(400)
        .json({ message: "Patient with this NIC already exists" });
    }

    // Check if email already exists
    const existingEmail = await Patient.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if phone already exists as username
    const existingUser = await User.findOne({ username: phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // Get staff record to link
    const staff = await Staff.findOne({ userId: staffUserId });
    if (!staff) {
      return res.status(403).json({ message: "Staff record not found" });
    }

    // Generate password
    const password = generatePassword();

    // Create user account (username = phone number)
    const user = new User({
      username: phone,
      role: "patient",
    });
    await user.setPassword(password);
    await user.save();

    // Create patient record
    const patient = new Patient({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      phone,
      dob,
      address,
      gender,
      nic: nic.trim().toUpperCase(),
      registeredBy: staff._id,
    });
    await patient.save();

    // Generate health card with QR code
    const cardNumber = await generateCardNumber();
    const { qrCodeData, qrCodeImage } = await generateQRCode({
      patientId: patient._id.toString(),
      cardNumber,
      issuedDate: new Date(),
    });

    const healthCard = new HealthCard({
      cardNumber,
      patientId: patient._id,
      qrCodeData,
      qrCodeImage,
    });
    await healthCard.save();

    // Send credentials via email
    await sendPatientCredentials({
      to: email,
      patientName: name,
      username: phone,
      password,
      cardNumber,
    });

    res.status(201).json({
      message: "Patient registered successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        nic: patient.nic,
      },
      credentials: {
        username: phone,
        password,
      },
      healthCard: {
        cardNumber,
        qrCodeImage,
      },
    });
  } catch (error) {
    console.error("Register patient error:", error);
    res.status(500).json({ message: "Failed to register patient" });
  }
};

/**
 * Get patients registered by this staff
 */
exports.getPatients = async (req, res) => {
  try {
    const staffUserId = req.user.id;
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get staff record
    const staff = await Staff.findOne({ userId: staffUserId });
    if (!staff) {
      return res.status(403).json({ message: "Staff record not found" });
    }

    let query = { registeredBy: staff._id };
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { nic: { $regex: search, $options: "i" } },
        ],
      };
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Patient.countDocuments({ ...query });

    res.json({
      patients: patients.map((p) => ({
        id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        nic: p.nic,
        dob: p.dob,
        gender: p.gender,
        address: p.address,
        status: p.status,
        createdAt: p.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

/**
 * Get specific patient details
 */
exports.getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate("userId", "username status")
      .populate("registeredBy", "fullName");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const healthCard = await HealthCard.findOne({ patientId: patient._id });

    res.json({
      patient: {
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
        registeredBy: patient.registeredBy?.fullName,
        createdAt: patient.createdAt,
      },
      healthCard: healthCard
        ? {
            cardNumber: healthCard.cardNumber,
            issuedDate: healthCard.issuedDate,
            status: healthCard.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Get patient details error:", error);
    res.status(500).json({ message: "Failed to fetch patient details" });
  }
};

/**
 * Update patient information
 */
exports.updatePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { name, email, phone, address } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update allowed fields
    if (name) patient.name = name;
    if (address) patient.address = address;

    // Check email uniqueness if changed
    if (email && email !== patient.email) {
      const existing = await Patient.findOne({
        email,
        _id: { $ne: patientId },
      });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      patient.email = email;
    }

    // Check phone uniqueness if changed
    if (phone && phone !== patient.phone) {
      const existing = await Patient.findOne({
        phone,
        _id: { $ne: patientId },
      });
      if (existing) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
      patient.phone = phone;

      // Update username in User model
      await User.findByIdAndUpdate(patient.userId, { username: phone });
    }

    await patient.save();

    res.json({
      message: "Patient updated successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
      },
    });
  } catch (error) {
    console.error("Update patient error:", error);
    res.status(500).json({ message: "Failed to update patient" });
  }
};
