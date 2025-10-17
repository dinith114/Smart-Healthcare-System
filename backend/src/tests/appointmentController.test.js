/**
 * Unit Tests for Appointment Controller
 * Tests all appointment management functions with >80% coverage
 * Covers positive, negative, edge, and error cases
 */

const {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAppointments,
} = require("../controllers/appointment/appointmentController");

// Mock dependencies
jest.mock("../models/appointment/appointmentModel");
jest.mock("../utils/appointment/slotUtils");
jest.mock("../services/appointment/notificationService");
jest.mock("../models/AuditLog");

const Appointment = require("../models/appointment/appointmentModel");
const { isSlotAvailable, normalizeToSlot } = require("../utils/appointment/slotUtils");
const { sendNotification, queueReminder24h } = require("../services/appointment/notificationService");
const AuditLog = require("../models/AuditLog");

describe("Appointment Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      user: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock console methods
    console.error = jest.fn();
    console.log = jest.fn();
  });

  describe("createAppointment", () => {
    const mockAppointment = {
      _id: "appointment123",
      patientId: "patient123",
      doctorId: "doctor123",
      date: new Date("2025-12-01T10:00:00.000Z"),
      notes: "Regular checkup",
      status: "Confirmed",
    };

    const mockSlot = new Date("2025-12-01T10:00:00.000Z");

    beforeEach(() => {
      req.body = {
        patientId: "patient123",
        doctorId: "doctor123",
        date: "2025-12-01T10:00:00.000Z",
        notes: "Regular checkup",
      };

      normalizeToSlot.mockReturnValue(mockSlot);
      isSlotAvailable.mockResolvedValue(true);
      Appointment.create.mockResolvedValue(mockAppointment);
      sendNotification.mockResolvedValue(true);
      queueReminder24h.mockResolvedValue(true);
      AuditLog.create.mockResolvedValue({});
    });

    describe("Positive cases", () => {
      test("should create appointment successfully with all required fields", async () => {
        await createAppointment(req, res);

        expect(normalizeToSlot).toHaveBeenCalledWith("2025-12-01T10:00:00.000Z");
        expect(isSlotAvailable).toHaveBeenCalledWith(
          "doctor123",
          "patient123",
          mockSlot.toISOString()
        );
        expect(Appointment.create).toHaveBeenCalledWith({
          patientId: "patient123",
          doctorId: "doctor123",
          date: mockSlot,
          notes: "Regular checkup",
          status: "Confirmed",
        });
        expect(sendNotification).toHaveBeenCalledWith(
          "patient123",
          `Appointment confirmed on ${mockSlot.toISOString()}`
        );
        expect(queueReminder24h).toHaveBeenCalledWith(
          "appointment123",
          "patient123",
          mockSlot
        );
        expect(AuditLog.create).toHaveBeenCalledWith({
          actorId: "patient123",
          action: "AppointmentCreated",
          meta: {
            appointmentId: "appointment123",
            doctorId: "doctor123",
            date: mockSlot,
          },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment created successfully",
          appointment: mockAppointment,
        });
      });

      test("should create appointment without notes", async () => {
        req.body.notes = undefined;

        await createAppointment(req, res);

        expect(Appointment.create).toHaveBeenCalledWith({
          patientId: "patient123",
          doctorId: "doctor123",
          date: mockSlot,
          notes: undefined,
          status: "Confirmed",
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });

      test("should handle empty notes string", async () => {
        req.body.notes = "";

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment created successfully",
          appointment: mockAppointment,
        });
      });
    });

    describe("Negative cases - validation errors", () => {
      test("should return 400 if patientId is missing", async () => {
        req.body.patientId = undefined;

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "patientId, doctorId, and date are required",
        });
        expect(Appointment.create).not.toHaveBeenCalled();
      });

      test("should return 400 if doctorId is missing", async () => {
        req.body.doctorId = undefined;

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "patientId, doctorId, and date are required",
        });
      });

      test("should return 400 if date is missing", async () => {
        req.body.date = undefined;

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "patientId, doctorId, and date are required",
        });
      });

      test("should return 400 if all fields are missing", async () => {
        req.body = {};

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: "patientId, doctorId, and date are required",
        });
      });

      test("should return 409 if slot is not available", async () => {
        isSlotAvailable.mockResolvedValue(false);

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          message: "Selected time no longer available.",
        });
        expect(Appointment.create).not.toHaveBeenCalled();
      });
    });

    describe("Edge cases", () => {
      test("should handle patientId as empty string", async () => {
        req.body.patientId = "";

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      test("should handle null values", async () => {
        req.body.patientId = null;

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      test("should handle notification failure gracefully", async () => {
        sendNotification.mockRejectedValue(new Error("Notification failed"));

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle reminder queue failure gracefully", async () => {
        queueReminder24h.mockRejectedValue(new Error("Queue failed"));

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle audit log creation failure", async () => {
        AuditLog.create.mockRejectedValue(new Error("Audit failed"));

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe("Error cases", () => {
      test("should handle database creation error", async () => {
        Appointment.create.mockRejectedValue(new Error("Database error"));

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "System error. Please try again later.",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle slot availability check failure", async () => {
        isSlotAvailable.mockRejectedValue(new Error("Availability check failed"));

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle normalizeToSlot error", async () => {
        normalizeToSlot.mockImplementation(() => {
          throw new Error("Invalid date format");
        });

        await createAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("rescheduleAppointment", () => {
    const mockAppointment = {
      _id: "appointment123",
      patientId: "patient123",
      doctorId: "doctor123",
      date: new Date("2025-12-01T10:00:00.000Z"),
      status: "Confirmed",
      save: jest.fn().mockResolvedValue(true),
    };

    const newSlot = new Date("2025-12-05T14:00:00.000Z");

    beforeEach(() => {
      req.params = { id: "appointment123" };
      req.body = { newDate: "2025-12-05T14:00:00.000Z" };

      Appointment.findById.mockResolvedValue(mockAppointment);
      normalizeToSlot.mockReturnValue(newSlot);
      isSlotAvailable.mockResolvedValue(true);
      sendNotification.mockResolvedValue(true);
      queueReminder24h.mockResolvedValue(true);
      AuditLog.create.mockResolvedValue({});
      mockAppointment.save.mockResolvedValue(mockAppointment);
    });

    describe("Positive cases", () => {
      test("should reschedule appointment successfully", async () => {
        await rescheduleAppointment(req, res);

        expect(Appointment.findById).toHaveBeenCalledWith("appointment123");
        expect(normalizeToSlot).toHaveBeenCalledWith("2025-12-05T14:00:00.000Z");
        expect(isSlotAvailable).toHaveBeenCalledWith(
          "doctor123",
          "patient123",
          newSlot.toISOString()
        );
        expect(mockAppointment.save).toHaveBeenCalled();
        expect(mockAppointment.date).toBe(newSlot);
        expect(mockAppointment.status).toBe("Rescheduled");
        expect(sendNotification).toHaveBeenCalledWith(
          "patient123",
          `Appointment rescheduled to ${newSlot.toISOString()}`
        );
        expect(queueReminder24h).toHaveBeenCalledWith(
          "appointment123",
          "patient123",
          newSlot
        );
        expect(AuditLog.create).toHaveBeenCalledWith({
          actorId: "patient123",
          action: "AppointmentRescheduled",
          meta: {
            appointmentId: "appointment123",
            doctorId: "doctor123",
            date: newSlot,
          },
        });
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment rescheduled successfully",
          appointment: mockAppointment,
        });
      });

      test("should handle ObjectId conversion", async () => {
        mockAppointment.patientId = { toString: () => "patient123" };
        mockAppointment.doctorId = { toString: () => "doctor123" };

        await rescheduleAppointment(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment rescheduled successfully",
          appointment: mockAppointment,
        });
      });
    });

    describe("Negative cases", () => {
      test("should return 404 if appointment not found", async () => {
        Appointment.findById.mockResolvedValue(null);

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment not found",
        });
        expect(mockAppointment.save).not.toHaveBeenCalled();
      });

      test("should return 409 if new slot is not available", async () => {
        isSlotAvailable.mockResolvedValue(false);

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          message: "Selected time no longer available.",
        });
        expect(mockAppointment.save).not.toHaveBeenCalled();
      });

      test("should handle missing newDate", async () => {
        req.body.newDate = undefined;
        normalizeToSlot.mockImplementation(() => {
          throw new Error("Invalid date");
        });

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe("Edge cases", () => {
      test("should handle invalid appointment ID format", async () => {
        Appointment.findById.mockRejectedValue(new Error("Invalid ID"));

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle save failure", async () => {
        mockAppointment.save.mockRejectedValue(new Error("Save failed"));

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle notification failure after rescheduling", async () => {
        sendNotification.mockRejectedValue(new Error("Notification failed"));

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle audit log failure", async () => {
        AuditLog.create.mockRejectedValue(new Error("Audit failed"));

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe("Error cases", () => {
      test("should handle database query error", async () => {
        Appointment.findById.mockRejectedValue(new Error("DB error"));

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "System error. Please try again later.",
        });
      });

      test("should handle slot availability check error", async () => {
        isSlotAvailable.mockRejectedValue(new Error("Check failed"));

        await rescheduleAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("cancelAppointment", () => {
    const mockAppointment = {
      _id: "appointment123",
      patientId: "patient123",
      doctorId: "doctor123",
      date: new Date("2025-12-01T10:00:00.000Z"),
      status: "Confirmed",
      save: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
      req.params = { id: "appointment123" };

      Appointment.findById.mockResolvedValue(mockAppointment);
      sendNotification.mockResolvedValue(true);
      AuditLog.create.mockResolvedValue({});
      mockAppointment.save.mockResolvedValue(mockAppointment);
    });

    describe("Positive cases", () => {
      test("should cancel appointment successfully", async () => {
        await cancelAppointment(req, res);

        expect(Appointment.findById).toHaveBeenCalledWith("appointment123");
        expect(mockAppointment.status).toBe("Cancelled");
        expect(mockAppointment.save).toHaveBeenCalled();
        expect(sendNotification).toHaveBeenCalledWith(
          "patient123",
          `Appointment on ${mockAppointment.date.toISOString()} cancelled`
        );
        expect(AuditLog.create).toHaveBeenCalledWith({
          actorId: "patient123",
          action: "AppointmentCancelled",
          meta: {
            appointmentId: "appointment123",
            doctorId: "doctor123",
            date: mockAppointment.date,
          },
        });
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment cancelled successfully",
          appointment: mockAppointment,
        });
      });

      test("should cancel already rescheduled appointment", async () => {
        mockAppointment.status = "Rescheduled";

        await cancelAppointment(req, res);

        expect(mockAppointment.status).toBe("Cancelled");
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment cancelled successfully",
          appointment: mockAppointment,
        });
      });

      test("should handle ObjectId fields", async () => {
        mockAppointment.patientId = { toString: () => "patient123" };
        mockAppointment.doctorId = { toString: () => "doctor123" };

        await cancelAppointment(req, res);

        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment cancelled successfully",
          appointment: mockAppointment,
        });
      });
    });

    describe("Negative cases", () => {
      test("should return 404 if appointment not found", async () => {
        Appointment.findById.mockResolvedValue(null);

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment not found",
        });
        expect(mockAppointment.save).not.toHaveBeenCalled();
      });

      test("should return 404 for non-existent appointment ID", async () => {
        Appointment.findById.mockResolvedValue(null);
        req.params.id = "nonexistent123";

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      });
    });

    describe("Edge cases", () => {
      test("should handle already cancelled appointment", async () => {
        mockAppointment.status = "Cancelled";

        await cancelAppointment(req, res);

        expect(mockAppointment.status).toBe("Cancelled");
        expect(res.json).toHaveBeenCalledWith({
          message: "Appointment cancelled successfully",
          appointment: mockAppointment,
        });
      });

      test("should handle save failure", async () => {
        mockAppointment.save.mockRejectedValue(new Error("Save failed"));

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle notification failure", async () => {
        sendNotification.mockRejectedValue(new Error("Notification failed"));

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle audit log failure", async () => {
        AuditLog.create.mockRejectedValue(new Error("Audit failed"));

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle invalid appointment ID format", async () => {
        Appointment.findById.mockRejectedValue(new Error("Invalid ObjectId"));

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe("Error cases", () => {
      test("should handle database error", async () => {
        Appointment.findById.mockRejectedValue(new Error("Database error"));

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "System error. Please try again later.",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle unexpected error during cancellation", async () => {
        mockAppointment.save.mockImplementation(() => {
          throw new Error("Unexpected error");
        });

        await cancelAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe("getAppointments", () => {
    const mockAppointments = [
      {
        _id: "appt1",
        patientId: { username: "John Doe" },
        doctorId: { username: "Dr. Smith", specialty: "Cardiology" },
        date: new Date("2025-12-01T10:00:00.000Z"),
        status: "Confirmed",
      },
      {
        _id: "appt2",
        patientId: { username: "Jane Doe" },
        doctorId: { username: "Dr. Jones", specialty: "Pediatrics" },
        date: new Date("2025-12-05T14:00:00.000Z"),
        status: "Rescheduled",
      },
    ];

    beforeEach(() => {
      const mockPopulate2 = jest.fn().mockResolvedValue(mockAppointments);
      const mockPopulate1 = jest.fn().mockReturnValue({
        populate: mockPopulate2,
      });
      Appointment.find.mockReturnValue({
        populate: mockPopulate1,
      });
    });

    describe("Positive cases", () => {
      test("should get appointments for patient role", async () => {
        req.user = { id: "patient123", role: "patient" };

        await getAppointments(req, res);

        expect(Appointment.find).toHaveBeenCalledWith({
          patientId: "patient123",
        });
        expect(res.json).toHaveBeenCalledWith(mockAppointments);
      });

      test("should get appointments for doctor role", async () => {
        req.user = { id: "doctor123", role: "doctor" };

        await getAppointments(req, res);

        expect(Appointment.find).toHaveBeenCalledWith({
          doctorId: "doctor123",
        });
        expect(res.json).toHaveBeenCalledWith(mockAppointments);
      });

      test("should return empty array when no appointments found", async () => {
        const mockPopulate2 = jest.fn().mockResolvedValue([]);
        const mockPopulate1 = jest.fn().mockReturnValue({
          populate: mockPopulate2,
        });
        Appointment.find.mockReturnValue({
          populate: mockPopulate1,
        });
        req.user = { id: "patient123", role: "patient" };

        await getAppointments(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
      });

      test("should populate doctor and patient information", async () => {
        req.user = { id: "patient123", role: "patient" };

        await getAppointments(req, res);

        const mockPopulate1 = Appointment.find().populate;
        expect(mockPopulate1).toHaveBeenCalledWith("doctorId", "username specialty");
      });
    });

    describe("Negative cases", () => {
      test("should default to patient query when role is not doctor", async () => {
        req.user = { id: "staff123", role: "staff" };

        await getAppointments(req, res);

        expect(Appointment.find).toHaveBeenCalledWith({
          patientId: "staff123",
        });
      });

      test("should default to patient query when role is undefined", async () => {
        req.user = { id: "user123" };

        await getAppointments(req, res);

        expect(Appointment.find).toHaveBeenCalledWith({
          patientId: "user123",
        });
      });

      test("should handle missing user object", async () => {
        req.user = undefined;

        await getAppointments(req, res);

        // When user is undefined, it will cause an error trying to access user.role
        expect(res.status).toHaveBeenCalledWith(500);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("Edge cases", () => {
      test("should handle null user", async () => {
        req.user = null;

        await getAppointments(req, res);

        // When user is null, it will cause an error trying to access user.role
        expect(res.status).toHaveBeenCalledWith(500);
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle empty user id", async () => {
        req.user = { id: "", role: "patient" };

        await getAppointments(req, res);

        expect(Appointment.find).toHaveBeenCalledWith({
          patientId: "",
        });
      });

      test("should handle case-sensitive role check", async () => {
        req.user = { id: "doctor123", role: "Doctor" };

        await getAppointments(req, res);

        // Should default to patient query since role is not exactly "doctor"
        expect(Appointment.find).toHaveBeenCalledWith({
          patientId: "doctor123",
        });
      });

      test("should handle large number of appointments", async () => {
        const largeArray = Array(100).fill(mockAppointments[0]);
        const mockPopulate2 = jest.fn().mockResolvedValue(largeArray);
        const mockPopulate1 = jest.fn().mockReturnValue({
          populate: mockPopulate2,
        });
        Appointment.find.mockReturnValue({
          populate: mockPopulate1,
        });
        req.user = { id: "patient123", role: "patient" };

        await getAppointments(req, res);

        expect(res.json).toHaveBeenCalledWith(largeArray);
        expect(largeArray.length).toBe(100);
      });
    });

    describe("Error cases", () => {
      test("should handle database query error", async () => {
        Appointment.find.mockImplementation(() => {
          throw new Error("Database error");
        });
        req.user = { id: "patient123", role: "patient" };

        await getAppointments(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "System error. Please try again later.",
        });
        expect(console.error).toHaveBeenCalled();
      });

      test("should handle populate error", async () => {
        const mockPopulate1 = jest.fn().mockImplementation(() => {
          throw new Error("Populate error");
        });
        Appointment.find.mockReturnValue({
          populate: mockPopulate1,
        });
        req.user = { id: "patient123", role: "patient" };

        await getAppointments(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      test("should handle network timeout error", async () => {
        const mockPopulate2 = jest.fn().mockRejectedValue(new Error("Network timeout"));
        const mockPopulate1 = jest.fn().mockReturnValue({
          populate: mockPopulate2,
        });
        Appointment.find.mockReturnValue({
          populate: mockPopulate1,
        });
        req.user = { id: "doctor123", role: "doctor" };

        await getAppointments(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(console.error).toHaveBeenCalled();
      });
    });
  });
});

