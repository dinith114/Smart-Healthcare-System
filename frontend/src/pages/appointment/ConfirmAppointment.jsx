import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { getQuote } from "../../services/appointment/billing";
import { useEffect, useState } from "react";

export default function ConfirmAppointment() {
  const nav = useNavigate();
  const { state } = useLocation();
  const draft = state?.draft || null;

  const [err, setErr] = useState("");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  // If user hit this page directly, bounce back to form
  if (!draft) {
    nav("/appointments/new");
    return null;
  }

  const { doctor, doctorId, isoDate, notes, patientId, type } = draft;
  const prettyDate = dayjs(isoDate).format("DD/MM/YYYY");
  const prettyTime = dayjs(isoDate).format("hh:mm A");

  useEffect(() => {
    setQuoteLoading(true);
    getQuote(doctorId)
      .then((q) => setQuote(q))
      .catch(() => setQuote(null))
      .finally(() => setQuoteLoading(false));
  }, [doctorId]);

  // NEW: Proceed to payment, pass all needed data
  const onProceedToPayment = () => {
    if (!quote) return;
    const payload = {
      doctorId,
      doctorName: doctor?.username || quote?.doctorName || "Doctor",
      specialty: doctor?.specialty || quote?.specialty || "General",
      amount: quote.amount,
      currency: quote.currency || "LKR",
      isoDate,
      notes,
      patientId,
      type,
    };
    nav("/payment", { state: { payment: payload } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8aa082] to-[#7e957a] p-4 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Confirm Appointment</h1>
          <p className="text-white/80 mt-1">Review details before confirming</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {err}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Doctor</div>
              <div className="text-[#2d3b2b]">{doctor?.username || "Doctor"}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Specialty</div>
              <div className="text-[#2d3b2b]">{doctor?.specialty || quote?.specialty || "General"}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Date</div>
              <div className="text-[#2d3b2b]">{prettyDate}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#2d3b2b]">Time</div>
              <div className="text-[#2d3b2b]">{prettyTime}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-semibold text-[#2d3b2b]">Type of visit</div>
              <div className="text-[#2d3b2b]">{type || "-"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-semibold text-[#2d3b2b]">Notes</div>
              <div className="text-[#2d3b2b]">{notes || "-"}</div>
            </div>
          </div>

          {/* Amount from backend */}
          <div className="mt-6 bg-[#f7faf7] border border-[#e3eee2] rounded-xl p-4 flex items-center justify-between">
            <div className="text-[#2d3b2b]">
              <div className="font-semibold">Amount</div>
              <div className="text-sm text-gray-600">Based on specialty</div>
            </div>
            <div className="text-2xl font-bold text-[#2d3b2b] min-w-[140px] text-right">
              {quoteLoading ? "…" : quote ? `Rs. ${quote.amount.toLocaleString()}` : "Rs. —"}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => nav(-1)}
              className="bg-white border border-[#b9c8b4] hover:border-[#7e957a] text-[#2d3b2b] px-5 py-3 rounded-lg transition"
            >
              Go Back
            </button>

            {/* Confirm -> Payment */}
            <button
              onClick={onProceedToPayment}
              disabled={quoteLoading || !quote}
              className="bg-[#7e957a] hover:bg-[#6e8a69] text-white px-5 py-3 rounded-lg transition disabled:opacity-50"
            >
              {quoteLoading ? "Loading price…" : "Confirm"}
            </button>
          </div>
        </div>

        {/* Footer helper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="text-center text-white/80 text-sm mt-6"
        >
          <p>You’ll be redirected to payment to complete your booking.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
