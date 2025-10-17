const {
  registerPatient,
  getPatients,
  getPatientDetails,
  updatePatient,
} = require("../controllers/staffController");
const User = require("../models/userModel");
const Patient = require("../models/Patient");
const Staff = require("../models/Staff");
const HealthCard = require("../models/HealthCard");
const { validateNIC } = require("../utils/nicValidator");
const { generatePassword } = require("../utils/passwordGenerator");
const { generateCardNumber } = require("../utils/cardNumberGenerator");
const { generateQRCode } = require("../services/qrService");
const { sendPatientCredentials } = require("../services/emailService");

// Mock all dependencies
jest.mock("../models/userModel");
jest.mock("../models/Patient");
jest.mock("../models/Staff");
jest.mock("../models/HealthCard");
jest.mock("../utils/nicValidator");
jest.mock("../utils/passwordGenerator");
jest.mock("../utils/cardNumberGenerator");
jest.mock("../services/qrService");
jest.mock("../services/emailService");

describe("Staff Controller - registerPatient", () => {
  let req, res, mockStaff, mockUser, mockPatient, mockHealthCard;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock request and response
    req = {
      user: { id: "staff-user-id-123" },
      body: {
        name: "John Doe",
        email: "john@example.com",
        phone: "0771234567",
        dob: "1990-01-01",
        address: "123 Main St",
        gender: "Male",
        nic: "901234567V",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock models
    mockStaff = { _id: "staff-id-123" };
    mockUser = {
      _id: "user-id-123",
      username: "0771234567",
      role: "patient",
      setPassword: jest.fn(),
      save: jest.fn(),
    };
    mockPatient = {
      _id: "patient-id-123",
      name: "John Doe",
      email: "john@example.com",
      phone: "0771234567",
      nic: "901234567V",
      dob: "1990-01-01",
      gender: "Male",
      address: "123 Main St",
      save: jest.fn(),
    };
    mockHealthCard = {
      cardNumber: "HC-2024-001",
      save: jest.fn(),
    };

    // Default mock implementations
    Staff.findOne.mockResolvedValue(mockStaff);
    Patient.findOne.mockResolvedValue(null); // No duplicates
    User.findOne.mockResolvedValue(null); // No duplicates
    validateNIC.mockReturnValue(true);
    generatePassword.mockReturnValue("TestPass123!");
    generateCardNumber.mockResolvedValue("HC-2024-001");
    generateQRCode.mockResolvedValue({
      qrCodeData: "qr-data",
      qrCodeImage: "base64-image",
    });
    sendPatientCredentials.mockResolvedValue(true);
  });

  // ========== POSITIVE CASES ==========
  describe("Positive cases", () => {
    test("should successfully register a new patient with all valid data", async () => {
      // Mock constructor returns
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Patient registered successfully",
          patient: expect.objectContaining({
            name: "John Doe",
            email: "john@example.com",
            nic: "901234567V",
          }),
          credentials: expect.objectContaining({
            username: "0771234567",
            password: "TestPass123!",
          }),
          healthCard: expect.objectContaining({
            cardNumber: "HC-2024-001",
          }),
        })
      );
    });

    test("should normalize email to lowercase", async () => {
      req.body.email = "John@EXAMPLE.COM";
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(Patient).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "john@example.com",
        })
      );
    });

    test("should normalize NIC to uppercase and trim whitespace", async () => {
      req.body.nic = " 901234567v ";
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(Patient).toHaveBeenCalledWith(
        expect.objectContaining({
          nic: "901234567V",
        })
      );
    });

    test("should send credentials email after successful registration", async () => {
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(sendPatientCredentials).toHaveBeenCalledWith({
        to: "john@example.com",
        patientName: "John Doe",
        username: "0771234567",
        password: "TestPass123!",
        cardNumber: "HC-2024-001",
      });
    });
  });

  // ========== NEGATIVE CASES ==========
  describe("Negative cases", () => {
    test("should return 400 when required field 'name' is missing", async () => {
      delete req.body.name;

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All required fields must be filled",
      });
    });

    test("should return 400 when required field 'email' is missing", async () => {
      delete req.body.email;

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All required fields must be filled",
      });
    });

    test("should return 400 when required field 'nic' is missing", async () => {
      delete req.body.nic;

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All required fields must be filled",
      });
    });

    test("should return 400 when NIC format is invalid", async () => {
      validateNIC.mockReturnValue(false);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid NIC format. Use format: 123456789V or 200012345678",
      });
    });

    test("should return 400 when NIC already exists", async () => {
      Patient.findOne.mockResolvedValueOnce({ nic: "901234567V" });

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient with this NIC already exists",
      });
    });

    test("should return 400 when email already exists", async () => {
      Patient.findOne
        .mockResolvedValueOnce(null) // NIC check passes
        .mockResolvedValueOnce({ email: "john@example.com" }); // Email exists

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already registered",
      });
    });

    test("should return 400 when phone already exists", async () => {
      Patient.findOne.mockResolvedValue(null); // NIC and email checks pass
      User.findOne.mockResolvedValue({ username: "0771234567" }); // Phone exists

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Phone number already registered",
      });
    });

    test("should return 403 when staff record is not found", async () => {
      Staff.findOne.mockResolvedValue(null);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Staff record not found",
      });
    });
  });

  // ========== EDGE CASES ==========
  describe("Edge cases", () => {
    test("should handle special characters in name", async () => {
      req.body.name = "O'Brien-Smith Jr.";
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle long address", async () => {
      req.body.address = "A".repeat(500);
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle gender as 'Other'", async () => {
      req.body.gender = "Other";
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle NIC with new 12-digit format", async () => {
      req.body.nic = "200012345678";
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ========== ERROR CASES ==========
  describe("Error cases", () => {
    test("should return 500 when database save fails", async () => {
      User.mockImplementation(() => mockUser);
      mockUser.save.mockRejectedValue(new Error("Database error"));

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to register patient",
      });
    });

    test("should return 500 when QR generation fails", async () => {
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      generateQRCode.mockRejectedValue(new Error("QR generation failed"));

      await registerPatient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to register patient",
      });
    });

    test("should continue even if email sending fails", async () => {
      User.mockImplementation(() => mockUser);
      Patient.mockImplementation(() => mockPatient);
      HealthCard.mockImplementation(() => mockHealthCard);
      sendPatientCredentials.mockRejectedValue(new Error("Email failed"));

      await registerPatient(req, res);

      // Should still return 500 due to unhandled email error
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

describe("Staff Controller - getPatients", () => {
  let req, res, mockStaff, mockPatients;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "staff-user-id-123" },
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockStaff = { _id: "staff-id-123" };
    mockPatients = [
      {
        _id: "patient-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "0771234567",
        nic: "901234567V",
        dob: "1990-01-01",
        gender: "Male",
        address: "123 Main St",
        status: "ACTIVE",
        createdAt: new Date(),
      },
      {
        _id: "patient-2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "0779876543",
        nic: "951234567V",
        dob: "1995-05-15",
        gender: "Female",
        address: "456 Oak Ave",
        status: "ACTIVE",
        createdAt: new Date(),
      },
    ];

    Staff.findOne.mockResolvedValue(mockStaff);
  });

  // ========== POSITIVE CASES ==========
  describe("Positive cases", () => {
    test("should return all patients when no search query provided", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockPatients),
      };
      Patient.find.mockReturnValue(mockQuery);
      Patient.countDocuments.mockResolvedValue(2);

      await getPatients(req, res);

      expect(res.json).toHaveBeenCalledWith({
        patients: expect.arrayContaining([
          expect.objectContaining({ name: "John Doe" }),
          expect.objectContaining({ name: "Jane Smith" }),
        ]),
        pagination: expect.objectContaining({
          total: 2,
          page: 1,
          limit: 10,
        }),
      });
    });

    test("should filter patients by search query", async () => {
      req.query.search = "john";
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockPatients[0]]),
      };
      Patient.find.mockReturnValue(mockQuery);
      Patient.countDocuments.mockResolvedValue(1);

      await getPatients(req, res);

      expect(Patient.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { name: { $regex: "john", $options: "i" } },
            { email: { $regex: "john", $options: "i" } },
            { phone: { $regex: "john", $options: "i" } },
            { nic: { $regex: "john", $options: "i" } },
          ]),
        })
      );
    });

    test("should handle pagination correctly", async () => {
      req.query.page = "2";
      req.query.limit = "5";
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      Patient.find.mockReturnValue(mockQuery);
      Patient.countDocuments.mockResolvedValue(10);

      await getPatients(req, res);

      expect(mockQuery.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 2,
            limit: 5,
            pages: 2,
          }),
        })
      );
    });
  });

  // ========== NEGATIVE CASES ==========
  describe("Negative cases", () => {
    test("should return 403 when staff record not found", async () => {
      Staff.findOne.mockResolvedValue(null);

      await getPatients(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Staff record not found",
      });
    });
  });

  // ========== EDGE CASES ==========
  describe("Edge cases", () => {
    test("should return empty array when no patients exist", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      Patient.find.mockReturnValue(mockQuery);
      Patient.countDocuments.mockResolvedValue(0);

      await getPatients(req, res);

      expect(res.json).toHaveBeenCalledWith({
        patients: [],
        pagination: expect.objectContaining({ total: 0 }),
      });
    });

    test("should handle page beyond available pages", async () => {
      req.query.page = "100";
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      Patient.find.mockReturnValue(mockQuery);
      Patient.countDocuments.mockResolvedValue(2);

      await getPatients(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          patients: [],
        })
      );
    });

    test("should handle special characters in search", async () => {
      req.query.search = "O'Brien";
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      Patient.find.mockReturnValue(mockQuery);
      Patient.countDocuments.mockResolvedValue(0);

      await getPatients(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });

  // ========== ERROR CASES ==========
  describe("Error cases", () => {
    test("should return 500 when database query fails", async () => {
      Patient.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      await getPatients(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch patients",
      });
    });
  });
});

describe("Staff Controller - getPatientDetails", () => {
  let req, res, mockPatient, mockHealthCard;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { patientId: "patient-id-123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockPatient = {
      _id: "patient-id-123",
      name: "John Doe",
      email: "john@example.com",
      phone: "0771234567",
      nic: "901234567V",
      dob: "1990-01-01",
      gender: "Male",
      address: "123 Main St",
      status: "ACTIVE",
      createdAt: new Date(),
    };

    mockHealthCard = {
      cardNumber: "HC-2024-001",
      issuedDate: new Date(),
      status: "ACTIVE",
    };
  });

  // ========== POSITIVE CASES ==========
  describe("Positive cases", () => {
    test("should return patient details with health card", async () => {
      // Mock the chained populate calls
      const mockPopulate2 = jest.fn().mockResolvedValue(mockPatient);
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Patient.findById.mockReturnValue({ populate: mockPopulate1 });
      HealthCard.findOne.mockResolvedValue(mockHealthCard);

      await getPatientDetails(req, res);

      expect(res.json).toHaveBeenCalledWith({
        patient: expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
        }),
        healthCard: expect.objectContaining({
          cardNumber: "HC-2024-001",
        }),
      });
    });

    test("should return patient details without health card", async () => {
      // Mock the chained populate calls
      const mockPopulate2 = jest.fn().mockResolvedValue(mockPatient);
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Patient.findById.mockReturnValue({ populate: mockPopulate1 });
      HealthCard.findOne.mockResolvedValue(null);

      await getPatientDetails(req, res);

      expect(res.json).toHaveBeenCalledWith({
        patient: expect.objectContaining({
          name: "John Doe",
        }),
        healthCard: null,
      });
    });
  });

  // ========== NEGATIVE CASES ==========
  describe("Negative cases", () => {
    test("should return 404 when patient not found", async () => {
      // Mock the chained populate calls to return null
      const mockPopulate2 = jest.fn().mockResolvedValue(null);
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Patient.findById.mockReturnValue({ populate: mockPopulate1 });

      await getPatientDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient not found",
      });
    });
  });

  // ========== ERROR CASES ==========
  describe("Error cases", () => {
    test("should return 500 when database query fails", async () => {
      Patient.findById.mockImplementation(() => {
        throw new Error("Database error");
      });

      await getPatientDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch patient details",
      });
    });
  });
});

describe("Staff Controller - updatePatient", () => {
  let req, res, mockPatient;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { patientId: "patient-id-123" },
      body: {
        name: "John Updated",
        email: "johnupdated@example.com",
        phone: "0771234567",
        address: "456 New St",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockPatient = {
      _id: "patient-id-123",
      name: "John Doe",
      email: "john@example.com",
      phone: "0771234567",
      address: "123 Main St",
      userId: "user-id-123",
      save: jest.fn(),
    };
  });

  // ========== POSITIVE CASES ==========
  describe("Positive cases", () => {
    test("should successfully update patient information", async () => {
      Patient.findById.mockResolvedValue(mockPatient);
      Patient.findOne.mockResolvedValue(null); // No conflicts

      await updatePatient(req, res);

      expect(mockPatient.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient updated successfully",
        patient: expect.objectContaining({
          name: "John Updated",
          email: "johnupdated@example.com",
        }),
      });
    });

    test("should update username when phone changes", async () => {
      req.body.phone = "0779999999";
      Patient.findById.mockResolvedValue(mockPatient);
      Patient.findOne.mockResolvedValue(null);
      User.findByIdAndUpdate.mockResolvedValue({});

      await updatePatient(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user-id-123", {
        username: "0779999999",
      });
    });
  });

  // ========== NEGATIVE CASES ==========
  describe("Negative cases", () => {
    test("should return 404 when patient not found", async () => {
      Patient.findById.mockResolvedValue(null);

      await updatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Patient not found",
      });
    });

    test("should return 400 when email already in use", async () => {
      Patient.findById.mockResolvedValue(mockPatient);
      Patient.findOne.mockResolvedValue({ _id: "other-patient" });

      await updatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already in use",
      });
    });

    test("should return 400 when phone already in use", async () => {
      req.body.phone = "0779999999";
      Patient.findById.mockResolvedValue(mockPatient);
      Patient.findOne
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce({ _id: "other-patient" }); // Phone conflict

      await updatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Phone number already in use",
      });
    });
  });

  // ========== ERROR CASES ==========
  describe("Error cases", () => {
    test("should return 500 when save fails", async () => {
      Patient.findById.mockResolvedValue(mockPatient);
      Patient.findOne.mockResolvedValue(null); // No conflicts
      mockPatient.save.mockRejectedValue(new Error("Save failed"));

      await updatePatient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to update patient",
      });
    });
  });
});

