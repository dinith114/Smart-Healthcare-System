const Patient = require("../models/Patient");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/avatars");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.params.patientId}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Upload patient avatar
 */
exports.uploadAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { patientId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Find the patient
      const patient = await Patient.findById(patientId);
      if (!patient) {
        // Delete uploaded file if patient not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Patient not found" });
      }

      // Delete old avatar file if exists
      if (patient.avatarUrl) {
        const oldFilePath = path.join(
          __dirname,
          "../../uploads/avatars",
          path.basename(patient.avatarUrl)
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update patient with new avatar URL (relative path)
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      patient.avatarUrl = avatarUrl;
      await patient.save();

      res.json({
        message: "Avatar uploaded successfully",
        url: avatarUrl,
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error("Upload avatar error:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  },
];

/**
 * Delete patient avatar
 */
exports.deleteAvatar = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Delete file if exists
    if (patient.avatarUrl) {
      const filePath = path.join(
        __dirname,
        "../../uploads/avatars",
        path.basename(patient.avatarUrl)
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update patient
    patient.avatarUrl = null;
    await patient.save();

    res.json({ message: "Avatar deleted successfully" });
  } catch (error) {
    console.error("Delete avatar error:", error);
    res.status(500).json({ message: "Failed to delete avatar" });
  }
};
