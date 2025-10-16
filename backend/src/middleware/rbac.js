// NOTE: temp RBAC for demo. In a real app you'd verify JWT etc.
module.exports.requireAccess = (mode = "VIEW") => {
  return async (req, res, next) => {
    try {
      const role = (req.header("x-role") || "").trim(); // 'Patient' | 'Provider'
      const actorId = (req.header("x-user-id") || "").trim(); // string ObjectId
      const consent =
        (req.header("x-provider-consent") || "").toLowerCase() === "true";

      if (!role || !actorId) {
        return res.status(401).json({ error: "Missing role or actor id" });
      }

      req.auth = { role, actorId, consent };
      const patientId = req.params.patientId;

      // Patients can only access their own record
      if (role === "Patient") {
        if (mode === "UPDATE")
          return res
            .status(403)
            .json({ error: "Patients cannot update records" });
        if (actorId !== patientId)
          return res
            .status(403)
            .json({ error: "Access denied (not your record)" });
        return next();
      }

      // Providers need consent to view/update a patient
      if (role === "Provider") {
        if (!consent)
          return res
            .status(403)
            .json({ error: "Access denied (no consent for provider)" });
        return next();
      }

      return res.status(403).json({ error: "Unknown role" });
    } catch (e) {
      next(e);
    }
  };
};
