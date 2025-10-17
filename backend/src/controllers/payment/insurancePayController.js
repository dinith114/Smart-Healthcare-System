const InsurancePayment = require("../../models/payment/insurancePayModel");
const { validateInsurancePayment } = require("../../utils/payment/insurancePayUtil");

exports.makeInsurancePayment = async (req, res) => {
  try {
  const { policyNumber, provider, insuredName, amount, appointmentId, appointmentInfo } = req.body;
    if (!validateInsurancePayment({ policyNumber, provider, insuredName })) {
      return res.status(400).json({
        success: false,
        message: "All insurance fields are required",
      });
    }
    // Simulate payment processing (always success for demo)
    const transactionId = `INS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const appointmentDetails = {
      appointmentId: appointmentId || appointmentInfo?.appointmentId || "",
      amount: appointmentInfo?.amount || amount || 0,
      currency: appointmentInfo?.currency || "LKR",
    };
    const payment = new InsurancePayment({
      policyNumber,
      provider,
      insuredName,
      amount: appointmentDetails.amount,
      status: "Success",
      transactionId,
      details: {
        appointmentInfo: appointmentDetails,
      },
    });
    await payment.save();
    return res.status(200).json({
      success: true,
      message: "Insurance payment saved!",
      data: {
        transactionId: payment.transactionId,
        timestamp: payment.createdAt,
        status: payment.status,
        paymentId: payment._id,
      },
    });
  } catch (error) {
    console.error("Insurance payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save insurance payment.",
    });
  }
};
