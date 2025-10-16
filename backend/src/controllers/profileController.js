const User = require("../models/userModel");
const Staff = require("../models/Staff");

/**
 * Get admin profile
 */
exports.getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * Update admin password
 */
exports.updateAdminPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Set new password
    await user.setPassword(newPassword);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update admin password error:", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};

/**
 * Get staff profile
 */
exports.getStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const staff = await Staff.findOne({ userId });
    if (!staff) {
      return res.status(404).json({ message: "Staff profile not found" });
    }

    res.json({
      id: staff._id,
      userId: user._id,
      username: user.username,
      fullName: staff.fullName,
      email: staff.email,
      contactNo: staff.contactNo,
      position: staff.position,
      status: staff.status,
      createdAt: staff.createdAt
    });
  } catch (error) {
    console.error("Get staff profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * Update staff profile
 */
exports.updateStaffProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, contactNo, currentPassword, newPassword } = req.body;

    const staff = await Staff.findOne({ userId });
    if (!staff) {
      return res.status(404).json({ message: "Staff profile not found" });
    }

    // Update staff details
    if (email && email !== staff.email) {
      const existing = await Staff.findOne({ email, _id: { $ne: staff._id } });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      staff.email = email;
    }

    if (contactNo) {
      staff.contactNo = contactNo;
    }

    await staff.save();

    // Update password if provided
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      const user = await User.findById(userId);
      const isValid = await user.validatePassword(currentPassword);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      await user.setPassword(newPassword);
      await user.save();
    }

    res.json({
      message: "Profile updated successfully",
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        contactNo: staff.contactNo
      }
    });
  } catch (error) {
    console.error("Update staff profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

