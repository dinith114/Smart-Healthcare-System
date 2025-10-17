const InsurancePayment = require("../../models/payment/insurancePayModel");
const { validateInsurancePayment } = require("../../utils/payment/insurancePayUtil");

exports.makeInsurancePayment = async (req, res) => {
  try {
    const { policyNumber, provider, insuredName, amount } = req.body;
    if (!validateInsurancePayment({ policyNumber, provider, insuredName })) {
      return res.status(400).json({
        success: false,
        message: "All insurance fields are required",
      });
    }
    // Simulate payment processing (always success for demo)
    const transactionId = `INS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const payment = new InsurancePayment({
      policyNumber,
      provider,
      insuredName,
      amount: amount || 0,
      status: "Success",
      transactionId,
      details: {
        appointmentInfo: "Dr Kusalya Widanagama - X-Ray Scanning",
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
