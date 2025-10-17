const Payment = require("../../models/payment/paymentModel");

/**
 * Get payment history for a patient
 * @route GET /api/payments/history?patientId=<id>
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required",
      });
    }

    // Find all payments for this patient
    const payments = await Payment.find({ patientId })
      .sort({ createdAt: -1 }) // Most recent first
      .select('amount method status transactionId createdAt appointmentId details')
      .lean();

    // Format the response
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      date: payment.createdAt,
      method: payment.method || 'Card',
      amount: payment.amount,
      status: payment.status || 'Completed',
      transactionId: payment.transactionId,
      appointmentId: payment.appointmentId,
      details: payment.details,
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};

