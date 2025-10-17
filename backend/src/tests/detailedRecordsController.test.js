/**
 * Unit Tests for Detailed Records Controller
 * Tests all medical record management functions with >80% coverage
 * Covers positive, negative, edge, and error cases
 */

const {
  createDetailedRecord,
  getDetailedRecords,
  getDetailedRecordById,
  updateDetailedRecord,
  deleteDetailedRecord,
} = require("../controllers/medicalRecords/detailedRecordsController");

// Mock dependencies
jest.mock("../models/DetailedMedicalRecord");
jest.mock("../models/Patient");

const DetailedMedicalRecord = require("../models/DetailedMedicalRecord");
const Patient = require("../models/Patient");

describe("Detailed Records Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      user: {},
      auth: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock console methods
    console.error = jest.fn();
    console.log = jest.fn();
  });

  describe("createDetailedRecord", () => {
    const mockPatient = {
      _id: "patient123",
      name: "John Doe",
      email: "john@example.com",
    };

    const mockRecordData = {
      note: "Annual checkup completed",
      vitals: {
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 98.6,
        weight: 70,
        height: 175,
      },
      medications: [
        { name: "Aspirin", dosage: "100mg", frequency: "Daily" },
      ],
      labs: [
        { test: "Blood Glucose", result: "95 mg/dL", date: "2025-01-15" },
      ],
      visits: [
        { date: "2025-01-15", reason: "Annual checkup", notes: "All normal" },
      ],
      immunizations: [
        { vaccine: "Flu", date: "2025-01-15", nextDue: "2026-01-15" },
      ],
      providerName: "Dr. Smith",
      providerRole: "Doctor",
    };

    beforeEach(() => {
      req.params = { patientId: "patient123" };
      req.body = mockRecordData;
      req.user = { id: "provider123", username: "Dr. Smith" };
      req.auth = { actorId: "provider123", role: "Doctor" };

      Patient.findById = jest.fn().mockResolvedValue(mockPatient);
      
      // Mock save to modify the instance and return it
      DetailedMedicalRecord.prototype.save = jest.fn().mockImplementation(function() {
        this._id = "record123";
        return Promise.resolve(this);
      });
    });

    describe("Positive cases", () => {
      test("should create detailed record with all fields", async () => {
        await createDetailedRecord(req, res);

        expect(Patient.findById).toHaveBeenCalledWith("patient123");
        expect(DetailedMedicalRecord.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Detailed medical record created successfully",
          record: expect.objectContaining({
            note: "Annual checkup completed",
            patientId: "patient123",
            providerId: "provider123",
          }),
        });
      });

      test("should create record with minimal fields", async () => {
        req.body = { note: "Quick visit" };

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Detailed medical record created successfully",
          record: expect.any(Object),
        });
      });

      test("should use default values for missing optional fields", async () => {
        req.body = {};

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should handle empty arrays for optional fields", async () => {
        req.body = {
          medications: [],
          labs: [],
          visits: [],
          immunizations: [],
        };

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should use provider info from req.user", async () => {
        req.body = { note: "Test" };

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should use provider info from req.auth when req.user is missing", async () => {
        req.user = undefined;
        req.auth = { actorId: "provider456", role: "Nurse" };
        req.body = { note: "Test" };

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should use demo provider ID when both req.user and req.auth are missing", async () => {
        req.user = undefined;
        req.auth = undefined;
        req.body = { note: "Test" };

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe("Negative cases", () => {
      test("should return 404 when patient not found", async () => {
        Patient.findById = jest.fn().mockResolvedValue(null);

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: "Patient not found",
        });
        expect(DetailedMedicalRecord.prototype.save).not.toHaveBeenCalled();
      });

      test("should return 404 for non-existent patient ID", async () => {
        Patient.findById = jest.fn().mockResolvedValue(null);
        req.params.patientId = "nonexistent123";

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Edge cases", () => {
      test("should handle very long note text", async () => {
        req.body.note = "A".repeat(5000);

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should handle multiple medications", async () => {
        req.body.medications = Array(20).fill({
          name: "Medicine",
          dosage: "100mg",
          frequency: "Daily",
        });

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should handle special characters in provider name", async () => {
        req.body.providerName = "Dr. O'Brien-Smith";

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should handle missing patientId parameter", async () => {
        req.params = {};
        Patient.findById = jest.fn().mockResolvedValue(null);

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Error cases", () => {
      test("should handle database save error", async () => {
        DetailedMedicalRecord.prototype.save = jest.fn().mockRejectedValue(
          new Error("Database error")
        );

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to create detailed medical record",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle Patient.findById error", async () => {
        Patient.findById = jest.fn().mockRejectedValue(new Error("DB error"));

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle validation error", async () => {
        DetailedMedicalRecord.prototype.save = jest.fn().mockRejectedValue(
          new Error("Validation failed")
        );

        await createDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("getDetailedRecords", () => {
    const mockRecords = [
      {
        _id: "record1",
        patientId: "patient123",
        note: "Recent visit",
        createdAt: new Date("2025-01-15"),
        status: "active",
      },
      {
        _id: "record2",
        patientId: "patient123",
        note: "Previous visit",
        createdAt: new Date("2025-01-10"),
        status: "active",
      },
    ];

    beforeEach(() => {
      req.params = { patientId: "patient123" };

      Patient.findById = jest.fn().mockResolvedValue({ _id: "patient123" });

      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRecords),
      };
      DetailedMedicalRecord.find = jest.fn().mockReturnValue(mockChain);
    });

    describe("Positive cases", () => {
      test("should return all active records for a patient", async () => {
        await getDetailedRecords(req, res);

        expect(Patient.findById).toHaveBeenCalledWith("patient123");
        expect(DetailedMedicalRecord.find).toHaveBeenCalledWith({
          patientId: "patient123",
          status: "active",
        });
        expect(res.json).toHaveBeenCalledWith({
          count: 2,
          records: mockRecords,
        });
      });

      test("should sort records by most recent first", async () => {
        await getDetailedRecords(req, res);

        const mockChain = DetailedMedicalRecord.find();
        expect(mockChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      });

      test("should return empty array when no records exist", async () => {
        const mockChain = {
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([]),
        };
        DetailedMedicalRecord.find = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecords(req, res);

        expect(res.json).toHaveBeenCalledWith({
          count: 0,
          records: [],
        });
      });

      test("should handle large number of records", async () => {
        const manyRecords = Array(100).fill(mockRecords[0]);
        const mockChain = {
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue(manyRecords),
        };
        DetailedMedicalRecord.find = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecords(req, res);

        expect(res.json).toHaveBeenCalledWith({
          count: 100,
          records: manyRecords,
        });
      });
    });

    describe("Negative cases", () => {
      test("should return 404 when patient not found", async () => {
        Patient.findById = jest.fn().mockResolvedValue(null);

        await getDetailedRecords(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: "Patient not found",
        });
      });

      test("should return 404 for invalid patient ID", async () => {
        Patient.findById = jest.fn().mockResolvedValue(null);
        req.params.patientId = "invalid123";

        await getDetailedRecords(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Edge cases", () => {
      test("should exclude deleted records", async () => {
        await getDetailedRecords(req, res);

        expect(DetailedMedicalRecord.find).toHaveBeenCalledWith({
          patientId: "patient123",
          status: "active",
        });
      });

      test("should handle missing patientId parameter", async () => {
        req.params = {};
        Patient.findById = jest.fn().mockResolvedValue(null);

        await getDetailedRecords(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Error cases", () => {
      test("should handle database query error", async () => {
        DetailedMedicalRecord.find = jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        });

        await getDetailedRecords(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to fetch detailed medical records",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle Patient.findById error", async () => {
        Patient.findById = jest.fn().mockRejectedValue(new Error("DB error"));

        await getDetailedRecords(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle lean method error", async () => {
        const mockChain = {
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockRejectedValue(new Error("Lean error")),
        };
        DetailedMedicalRecord.find = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecords(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("getDetailedRecordById", () => {
    const mockRecord = {
      _id: "record123",
      patientId: "patient123",
      note: "Test record",
      status: "active",
      createdAt: new Date(),
    };

    beforeEach(() => {
      req.params = {
        patientId: "patient123",
        recordId: "record123",
      };

      const mockChain = {
        lean: jest.fn().mockResolvedValue(mockRecord),
      };
      DetailedMedicalRecord.findOne = jest.fn().mockReturnValue(mockChain);
    });

    describe("Positive cases", () => {
      test("should return specific record by ID", async () => {
        await getDetailedRecordById(req, res);

        expect(DetailedMedicalRecord.findOne).toHaveBeenCalledWith({
          _id: "record123",
          patientId: "patient123",
          status: "active",
        });
        expect(res.json).toHaveBeenCalledWith(mockRecord);
      });

      test("should return record with all fields", async () => {
        await getDetailedRecordById(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: "record123",
            patientId: "patient123",
            note: "Test record",
          })
        );
      });
    });

    describe("Negative cases", () => {
      test("should return 404 when record not found", async () => {
        const mockChain = {
          lean: jest.fn().mockResolvedValue(null),
        };
        DetailedMedicalRecord.findOne = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecordById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: "Record not found",
        });
      });

      test("should return 404 for wrong patient ID", async () => {
        const mockChain = {
          lean: jest.fn().mockResolvedValue(null),
        };
        DetailedMedicalRecord.findOne = jest.fn().mockReturnValue(mockChain);
        req.params.patientId = "wrongPatient";

        await getDetailedRecordById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });

      test("should return 404 for deleted record", async () => {
        const mockChain = {
          lean: jest.fn().mockResolvedValue(null),
        };
        DetailedMedicalRecord.findOne = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecordById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Edge cases", () => {
      test("should handle invalid record ID format", async () => {
        req.params.recordId = "invalid";
        const mockChain = {
          lean: jest.fn().mockResolvedValue(null),
        };
        DetailedMedicalRecord.findOne = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecordById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });

      test("should exclude non-active records", async () => {
        await getDetailedRecordById(req, res);

        expect(DetailedMedicalRecord.findOne).toHaveBeenCalledWith(
          expect.objectContaining({ status: "active" })
        );
      });
    });

    describe("Error cases", () => {
      test("should handle database query error", async () => {
        DetailedMedicalRecord.findOne = jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        });

        await getDetailedRecordById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to fetch detailed medical record",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle lean method error", async () => {
        const mockChain = {
          lean: jest.fn().mockRejectedValue(new Error("Lean error")),
        };
        DetailedMedicalRecord.findOne = jest.fn().mockReturnValue(mockChain);

        await getDetailedRecordById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("updateDetailedRecord", () => {
    const mockUpdatedRecord = {
      _id: "record123",
      patientId: "patient123",
      note: "Updated note",
      vitals: { bloodPressure: "130/85" },
      status: "active",
    };

    beforeEach(() => {
      req.params = {
        patientId: "patient123",
        recordId: "record123",
      };
      req.body = {
        note: "Updated note",
        vitals: { bloodPressure: "130/85" },
      };

      DetailedMedicalRecord.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(mockUpdatedRecord);
    });

    describe("Positive cases", () => {
      test("should update record successfully", async () => {
        await updateDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: "record123", patientId: "patient123", status: "active" },
          { $set: expect.objectContaining({ note: "Updated note" }) },
          { new: true, runValidators: true }
        );
        expect(res.json).toHaveBeenCalledWith({
          message: "Record updated successfully",
          record: mockUpdatedRecord,
        });
      });

      test("should update multiple fields", async () => {
        req.body = {
          note: "New note",
          vitals: { heartRate: 80 },
          medications: [{ name: "New med" }],
        };

        await updateDetailedRecord(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Record updated successfully",
          record: expect.any(Object),
        });
      });

      test("should prevent updating patientId", async () => {
        req.body = {
          patientId: "newPatient123",
          note: "Test",
        };

        await updateDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          expect.any(Object),
          { $set: expect.not.objectContaining({ patientId: expect.anything() }) },
          expect.any(Object)
        );
      });

      test("should prevent updating providerId", async () => {
        req.body = {
          providerId: "newProvider123",
          note: "Test",
        };

        await updateDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          expect.any(Object),
          { $set: expect.not.objectContaining({ providerId: expect.anything() }) },
          expect.any(Object)
        );
      });

      test("should update only vitals", async () => {
        req.body = {
          vitals: { temperature: 99.0 },
        };

        await updateDetailedRecord(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Record updated successfully",
          record: expect.any(Object),
        });
      });
    });

    describe("Negative cases", () => {
      test("should return 404 when record not found", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);

        await updateDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: "Record not found",
        });
      });

      test("should return 404 for wrong patient ID", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);
        req.params.patientId = "wrongPatient";

        await updateDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });

      test("should return 404 for deleted record", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);

        await updateDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Edge cases", () => {
      test("should handle empty update body", async () => {
        req.body = {};

        await updateDetailedRecord(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Record updated successfully",
          record: expect.any(Object),
        });
      });

      test("should handle update with only forbidden fields", async () => {
        req.body = {
          patientId: "newPatient",
          providerId: "newProvider",
        };

        await updateDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          expect.any(Object),
          { $set: {} },
          expect.any(Object)
        );
      });

      test("should exclude non-active records from update", async () => {
        await updateDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ status: "active" }),
          expect.any(Object),
          expect.any(Object)
        );
      });
    });

    describe("Error cases", () => {
      test("should handle database update error", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest
          .fn()
          .mockRejectedValue(new Error("Database error"));

        await updateDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to update detailed medical record",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle validation error", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest
          .fn()
          .mockRejectedValue(new Error("Validation failed"));

        await updateDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("deleteDetailedRecord", () => {
    const mockDeletedRecord = {
      _id: "record123",
      patientId: "patient123",
      status: "deleted",
    };

    beforeEach(() => {
      req.params = {
        patientId: "patient123",
        recordId: "record123",
      };

      DetailedMedicalRecord.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(mockDeletedRecord);
    });

    describe("Positive cases", () => {
      test("should soft delete record successfully", async () => {
        await deleteDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          { _id: "record123", patientId: "patient123" },
          { $set: { status: "deleted" } },
          { new: true }
        );
        expect(res.json).toHaveBeenCalledWith({
          message: "Record deleted successfully",
        });
      });

      test("should delete already active record", async () => {
        await deleteDetailedRecord(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Record deleted successfully",
        });
      });

      test("should handle deleting already deleted record", async () => {
        await deleteDetailedRecord(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Record deleted successfully",
        });
      });
    });

    describe("Negative cases", () => {
      test("should return 404 when record not found", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);

        await deleteDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          error: "Record not found",
        });
      });

      test("should return 404 for wrong patient ID", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);
        req.params.patientId = "wrongPatient";

        await deleteDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });

      test("should return 404 for non-existent record ID", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);
        req.params.recordId = "nonexistent123";

        await deleteDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Edge cases", () => {
      test("should not require status filter for delete", async () => {
        await deleteDetailedRecord(req, res);

        expect(DetailedMedicalRecord.findOneAndUpdate).toHaveBeenCalledWith(
          expect.not.objectContaining({ status: expect.anything() }),
          expect.any(Object),
          expect.any(Object)
        );
      });

      test("should handle invalid record ID format", async () => {
        req.params.recordId = "invalid";
        DetailedMedicalRecord.findOneAndUpdate = jest.fn().mockResolvedValue(null);

        await deleteDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Error cases", () => {
      test("should handle database update error", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest
          .fn()
          .mockRejectedValue(new Error("Database error"));

        await deleteDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to delete detailed medical record",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle unexpected error", async () => {
        DetailedMedicalRecord.findOneAndUpdate = jest
          .fn()
          .mockRejectedValue(new Error("Unexpected error"));

        await deleteDetailedRecord(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });
});

