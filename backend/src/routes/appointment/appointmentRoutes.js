const express = require("express");
const { authenticate } = require("../../middleware/authMiddleware");

const {
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  getAppointments,
} = require("../../controllers/appointment/appointmentController");

const router = express.Router();

// ✅ require login for all appointment routes
router.use(authenticate);

router.post("/create-appointment", createAppointment);
router.put("/:id/reschedule", rescheduleAppointment);
router.put("/:id/cancel", cancelAppointment);
router.get("/get-appointment", getAppointments);

module.exports = router;
