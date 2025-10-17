const Patient = require("../../models/Patient");
const PatientSummary = require("../../models/PatientSummary");

exports.getPatientSummary = async (req, res, next) => {
  try {
    // basic patient identity (optional if you don't have Patient in DB yet)
    const p = await Patient.findById(req.params.patientId)
      .lean()
      .catch(() => null);

    // summary is stored here
    let s = await PatientSummary.findOne({
      patientId: req.params.patientId,
    }).lean();
    if (!s) {
      // create a sensible default on first access so UI has data
      s = await PatientSummary.create({
        patientId: req.params.patientId,
        vitals: {
          heartRate: 75,
          weightKg: 50,
          temperatureC: 37,
          oxygenSat: 94,
        },
        medications: ["2025 - March - 21", "2025 - May - 20"],
        labs: ["2025 - March - 20", "2025 - March - 10", "2025 - April - 23"],
        visits: [
          {
            date: new Date("2025-07-20"),
            reason: "Annual Physical exam",
            doctor: "Dr. Saman Gunawardana",
            summary: "Routine check-up; No significant issues noted",
          },
        ],
        immunizations: [
          {
            name: "COVID-19",
            by: "Nurse Johan",
            note: "Completed primary vaccination series",
          },
        ],
      });
      s = s.toObject();
    }

    const patient = p || {
      _id: req.params.patientId,
      name: "Kasun Rathnayake",
      email: "kasun@gmail.com",
      phone: "078 593 844",
      address: "No: 51/1, Malabe",
      gender: "Male",
      dob: new Date("1997-01-01"),
      avatarUrl: null,
    };

    res.json({ patient, ...s }); // sends vitals, medications, labs, visits, immunizations
  } catch (e) {
    next(e);
  }
};

// PATCH summary (Provider only)
exports.updatePatientSummary = async (req, res, next) => {
  try {
    // Basic validation / sanitization
    const payload = {};
    if (req.body.vitals) {
      const v = req.body.vitals;
      payload["vitals"] = {
        heartRate: Number(v.heartRate),
        weightKg: Number(v.weightKg),
        temperatureC: Number(v.temperatureC),
        oxygenSat: Number(v.oxygenSat),
      };
    }
    if (Array.isArray(req.body.medications))
      payload["medications"] = req.body.medications.map(String);
    if (Array.isArray(req.body.labs))
      payload["labs"] = req.body.labs.map(String);
    if (Array.isArray(req.body.visits)) {
      payload["visits"] = req.body.visits.map((v) => ({
        date: v.date ? new Date(v.date) : new Date(),
        reason: String(v.reason || ""),
        doctor: String(v.doctor || ""),
        summary: String(v.summary || ""),
      }));
    }
    if (Array.isArray(req.body.immunizations)) {
      payload["immunizations"] = req.body.immunizations.map((i) => ({
        name: String(i.name || ""),
        by: String(i.by || ""),
        note: String(i.note || ""),
      }));
    }

    const updated = await PatientSummary.findOneAndUpdate(
      { patientId: req.params.patientId },
      { $set: payload },
      { upsert: true, new: true }
    ).lean();

    res.json(updated);
  } catch (e) {
    next(e);
  }
};
