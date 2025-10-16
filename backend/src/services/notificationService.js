module.exports.notifyPatientUpdate = async ({ patientId, minimal }) => {
  // Stub: in real life push to email/SMS/etc.
  console.log("[Notify]", { patientId, minimal });
  return true;
};
