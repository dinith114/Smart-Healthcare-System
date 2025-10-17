const User = require("../models/userModel");
const Staff = require("../models/Staff");
const Patient = require("../models/Patient");
const Position = require("../models/Position");
const { generatePassword } = require("../utils/passwordGenerator");
const { sendStaffCredentials, sendPatientCredentials } = require("../services/emailService");

/**
 * Add new staff member
 */
exports.addStaff = async (req, res) => {
  try {
    const { fullName, email, contactNo, position, username } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!fullName || !email || !contactNo || !position || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate password
    const password = generatePassword();

    // Create user account
    const user = new User({ username, role: "staff" });
    await user.setPassword(password);
    await user.save();

    // Create staff record
    const staff = new Staff({
      userId: user._id,
      fullName,
      email,
      contactNo,
      position,
      addedBy: adminId
    });
    await staff.save();

    // Send credentials via email
    await sendStaffCredentials({
      to: email,
      staffName: fullName,
      username,
      password,
      position
    });

    res.status(201).json({
      message: "Staff member added successfully",
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        contactNo: staff.contactNo,
        position: staff.position,
        username,
        temporaryPassword: password
      }
    });
  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({ message: "Failed to add staff member" });
  }
};

/**
 * Get all staff members
 */
exports.getAllStaff = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { contactNo: { $regex: search, $options: "i" } }
        ]
      };
    }

    const staff = await Staff.find(query)
      .populate("userId", "username status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Staff.countDocuments(query);

    res.json({
      staff: staff.map(s => ({
        id: s._id,
        fullName: s.fullName,
        email: s.email,
        contactNo: s.contactNo,
        position: s.position,
        username: s.userId?.username,
        status: s.status,
        createdAt: s.createdAt
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get staff error:", error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
};

/**
 * Update staff member
 */
exports.updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { fullName, email, contactNo, position } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Check email uniqueness if changed
    if (email && email !== staff.email) {
      const existing = await Staff.findOne({ email, _id: { $ne: staffId } });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update fields
    if (fullName) staff.fullName = fullName;
    if (email) staff.email = email;
    if (contactNo) staff.contactNo = contactNo;
    if (position) staff.position = position;

    await staff.save();

    res.json({
      message: "Staff member updated successfully",
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        contactNo: staff.contactNo,
        position: staff.position
      }
    });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ message: "Failed to update staff member" });
  }
};

/**
 * Delete (deactivate) staff member
 */
exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Soft delete - mark as inactive
    staff.status = "INACTIVE";
    await staff.save();

    // Also deactivate user account
    await User.findByIdAndUpdate(staff.userId, { status: "INACTIVE" });

    res.json({ message: "Staff member deactivated successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ message: "Failed to deactivate staff member" });
  }
};

/**
 * Get all patients (admin view)
 */
exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { nic: { $regex: search, $options: "i" } }
        ]
      };
    }

    const patients = await Patient.find(query)
      .populate("userId", "username status")
      .populate("registeredBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Patient.countDocuments(query);

    res.json({
      patients: patients.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        nic: p.nic,
        dob: p.dob,
        gender: p.gender,
        address: p.address,
        status: p.status,
        registeredBy: p.registeredBy?.fullName,
        createdAt: p.createdAt
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

/**
 * Get admin dashboard statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments({ status: "ACTIVE" });
    const totalPatients = await Patient.countDocuments({ status: "ACTIVE" });
    const inactiveStaff = await Staff.countDocuments({ status: "INACTIVE" });
    
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPatients = await Patient.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalStaff,
      totalPatients,
      inactiveStaff,
      recentPatients
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
};

/**
 * Add new position
 */
exports.addPosition = async (req, res) => {
  try {
    const { title, description } = req.body;
    const adminId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Position title is required" });
    }

    // Check if position already exists
    const existingPosition = await Position.findOne({ 
      title: { $regex: new RegExp(`^${title}$`, 'i') } 
    });
    
    if (existingPosition) {
      return res.status(400).json({ message: "Position already exists" });
    }

    const position = new Position({
      title,
      description,
      createdBy: adminId
    });
    await position.save();

    res.status(201).json({
      message: "Position added successfully",
      position: {
        id: position._id,
        title: position.title,
        description: position.description
      }
    });
  } catch (error) {
    console.error("Add position error:", error);
    res.status(500).json({ message: "Failed to add position" });
  }
};

/**
 * Get all positions
 */
exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find({ isActive: true })
      .sort({ title: 1 });

    res.json({
      positions: positions.map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error("Get positions error:", error);
    res.status(500).json({ message: "Failed to fetch positions" });
  }
};

/**
 * Update position
 */
exports.updatePosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const { title, description } = req.body;

    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Check title uniqueness if changed
    if (title && title !== position.title) {
      const existing = await Position.findOne({ 
        title: { $regex: new RegExp(`^${title}$`, 'i') },
        _id: { $ne: positionId }
      });
      if (existing) {
        return res.status(400).json({ message: "Position title already exists" });
      }
    }

    if (title) position.title = title;
    if (description !== undefined) position.description = description;

    await position.save();

    res.json({
      message: "Position updated successfully",
      position: {
        id: position._id,
        title: position.title,
        description: position.description
      }
    });
  } catch (error) {
    console.error("Update position error:", error);
    res.status(500).json({ message: "Failed to update position" });
  }
};

/**
 * Delete position
 */
exports.deletePosition = async (req, res) => {
  try {
    const { positionId } = req.params;

    // Check if position is in use
    const staffUsingPosition = await Staff.findOne({ position: positionId });
    if (staffUsingPosition) {
      return res.status(400).json({ 
        message: "Cannot delete position that is currently assigned to staff members" 
      });
    }

    const position = await Position.findById(positionId);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Soft delete
    position.isActive = false;
    await position.save();

    res.json({ message: "Position deleted successfully" });
  } catch (error) {
    console.error("Delete position error:", error);
    res.status(500).json({ message: "Failed to delete position" });
  }
};

/**
 * Change patient mobile number (creates new account with new password)
 */
exports.changePatientMobile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { newMobile } = req.body;

    if (!newMobile) {
      return res.status(400).json({ message: "New mobile number is required" });
    }

    // Check if new mobile is already in use
    const existingUser = await User.findOne({ username: newMobile });
    if (existingUser) {
      return res.status(400).json({ message: "Mobile number already in use" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const oldMobile = patient.phone;

    // Get old user account
    const oldUser = await User.findById(patient.userId);
    if (!oldUser) {
      return res.status(404).json({ message: "User account not found" });
    }

    // Generate new password
    const newPassword = generatePassword();

    // Create new user account with new mobile number
    const newUser = new User({
      username: newMobile,
      role: "patient",
      status: "ACTIVE"
    });
    await newUser.setPassword(newPassword);
    await newUser.save();

    // Deactivate old user account
    oldUser.status = "INACTIVE";
    await oldUser.save();

    // Update patient record with new userId and phone
    patient.userId = newUser._id;
    patient.phone = newMobile;
    await patient.save();

    // Get health card to include in email
    const HealthCard = require("../models/HealthCard");
    const healthCard = await HealthCard.findOne({ patientId: patient._id });

    // Send new credentials via email
    await sendPatientCredentials({
      to: patient.email,
      patientName: patient.name,
      username: newMobile,
      password: newPassword,
      cardNumber: healthCard?.cardNumber || "N/A"
    });

    res.json({
      message: "Mobile number changed successfully. New credentials sent to patient email.",
      patient: {
        id: patient._id,
        name: patient.name,
        oldMobile,
        newMobile,
        email: patient.email
      },
      newCredentials: {
        username: newMobile,
        password: newPassword
      }
    });
  } catch (error) {
    console.error("Change patient mobile error:", error);
    res.status(500).json({ message: "Failed to change mobile number" });
  }
};

/**
 * Update patient status (Admin can deactivate patient)
 */
exports.updatePatientStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Valid status (ACTIVE or INACTIVE) is required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update patient status
    patient.status = status;
    await patient.save();

    // Also update the associated user account status
    const user = await User.findById(patient.userId);
    if (user) {
      user.status = status;
      await user.save();
    }

    res.json({
      message: `Patient status updated to ${status} successfully`,
      patient: {
        id: patient._id,
        name: patient.name,
        status: patient.status
      }
    });
  } catch (error) {
    console.error("Update patient status error:", error);
    res.status(500).json({ message: "Failed to update patient status" });
  }
};

