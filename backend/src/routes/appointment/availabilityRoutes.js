const express = require("express");
const { authenticate } = require("../../middleware/authMiddleware");
const Appointment = require("../../models/appointment/appointmentModel");

const router = express.Router();
router.use(authenticate);

// GET /api/appointments/availability?doctorId=xxx&date=YYYY-MM-DD
router.get("/", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date are required" });
    }

    // demo hours 09:00–17:00 in 30-min slots (UTC for simplicity)
    const day = new Date(`${date}T00:00:00.000Z`);
    const slots = [];
    for (let h = 9; h < 17; h++) {
      for (const m of [0, 30]) {
        const d = new Date(day);
        d.setUTCHours(h, m, 0, 0);
        slots.push(d);
      }
    }

    const booked = await Appointment.find({
      doctorId,
      date: { $in: slots },
      status: { $ne: "Cancelled" },
    }).select("date");

    const bookedMs = new Set(booked.map(b => +new Date(b.date)));
    const free = slots.filter(s => !bookedMs.has(+s));

    res.json(free.map(d => d.toISOString()));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "System error. Please try again later." });
  }
});

module.exports = router;
