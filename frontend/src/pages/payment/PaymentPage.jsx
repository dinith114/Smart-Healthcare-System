
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { jsPDF } from "jspdf";



const PaymentPage = () => {
  // Insurance form state
  const [insurance, setInsurance] = useState({
    policyNumber: "",
    provider: "",
    insuredName: "",
  });
  const [insuranceLoading, setInsuranceLoading] = useState(false);

  // Insurance form change handler
  const handleInsuranceChange = (e) => {
    const { name, value } = e.target;
    setInsurance((prev) => ({ ...prev, [name]: value }));
  };

  // Insurance form submit handler
  const [lastInsurancePayment, setLastInsurancePayment] = useState(null);
  const handleInsuranceSubmit = async (e) => {
    e.preventDefault();
    setInsuranceLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/insurance-payment/", insurance);
      if (res.data?.success) {
        Swal.fire({
          title: "Insurance Payment Successful",
          text: res.data.message || "Your insurance payment was processed successfully.",
          icon: "success",
          confirmButtonColor: "#5B7E57",
        });
        setLastInsurancePayment({
          ...insurance,
          ...res.data.data,
        });
        setInsurance({ policyNumber: "", provider: "", insuredName: "" });
      } else {
        Swal.fire({
          title: "Error",
          text: res.data?.message || "Failed to process insurance payment.",
          icon: "error",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to process insurance payment.",
        icon: "error",
      });
    }
    setInsuranceLoading(false);
  };
  const [tab, setTab] = useState("card");
  const [card, setCard] = useState({
    cardNumber: "",
    cardOwner: "",
    cvc: "",
    expiryMM: "",
    expiryYY: "",
  });
  const [saveCard, setSaveCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});
  // Saved cards from backend
  const [savedCards, setSavedCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState("");
  const [lastPayment, setLastPayment] = useState(null); // store last successful payment metadata

  const loadSavedCards = async () => {
    setCardsLoading(true);
    setCardsError("");
    try {
      const res = await axios.get("http://localhost:5000/api/payment/saved-cards");
      if (res.data.success) {
        setSavedCards(res.data.cards);
      } else {
        setCardsError("Failed to load saved cards");
      }
    } catch (err) {
      setCardsError("Failed to load saved cards");
    }
    setCardsLoading(false);
  };

  useEffect(() => {
    loadSavedCards();
  }, []);

  // Select a saved card and autofill the form (decrypt full card number from backend)
  const handleSelectSavedCard = async (savedCard) => {
    try {
      // Decrypt the card number from backend
      const res = await axios.post("http://localhost:5000/api/payment/decrypt-card", {
        encryptedNumber: savedCard.encryptedNumber,
      });
      
      if (res.data.success) {
        setCard({
          cardNumber: res.data.cardNumber,
          cardOwner: savedCard.cardOwner || "",
          cvc: "",
          expiryMM: savedCard.expiryMM || "",
          expiryYY: savedCard.expiryYY || "",
        });
      }
    } catch (err) {
      console.error("Failed to decrypt card:", err);
      setMsg("Failed to load saved card details");
    }
  };

  const handleDeleteSavedCard = async (cardItem) => {
    const confirm = await Swal.fire({
      title: "Remove saved card?",
      text: `This will remove ${cardItem.cardOwner}'s card ending ${cardItem.last4}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete("http://localhost:5000/api/payment/saved-cards", {
        data: {
          cardOwner: cardItem.cardOwner,
          last4: cardItem.last4,
          expiryMM: cardItem.expiryMM,
          expiryYY: cardItem.expiryYY,
        },
      });
      await loadSavedCards();
      Swal.fire({ title: "Deleted", text: "Saved card removed.", icon: "success", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "Failed to delete saved card", icon: "error" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "cardNumber") newValue = value.replace(/\D/g, "").slice(0, 16);
    if (name === "cvc") newValue = value.replace(/\D/g, "").slice(0, 4);
    if (name === "expiryMM") newValue = value.replace(/\D/g, "").slice(0, 2);
    if (name === "expiryYY") newValue = value.replace(/\D/g, "").slice(0, 2);
    setCard({ ...card, [name]: newValue });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate card number
    if (!card.cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (card.cardNumber.length < 13 || card.cardNumber.length > 19) {
      newErrors.cardNumber = "Card number must be 13-19 digits";
    }
    
    // Validate card owner
    if (!card.cardOwner.trim()) {
      newErrors.cardOwner = "Card owner name is required";
    }
    
    // Validate CVC
    if (!card.cvc) {
      newErrors.cvc = "CVC is required";
    } else if (card.cvc.length < 3 || card.cvc.length > 4) {
      newErrors.cvc = "CVC must be 3-4 digits";
    }
    
    // Validate expiry month
    if (!card.expiryMM) {
      newErrors.expiryMM = "Expiry month is required";
    } else {
      const month = parseInt(card.expiryMM);
      if (month < 1 || month > 12) {
        newErrors.expiryMM = "Month must be 01-12";
      }
    }
    
    // Validate expiry year
    if (!card.expiryYY) {
      newErrors.expiryYY = "Expiry year is required";
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const year = parseInt(card.expiryYY);
      if (year < currentYear) {
        newErrors.expiryYY = "Card has expired";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMsg("");
    setErrors({});
    
    // Validate form before submitting
    if (!validateForm()) {
      setMsg("Please fix the errors before submitting");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/payment/make-payment", {
        card,
        amount: 12500,
        saveCard,
      });
      setMsg(res.data.message);
      // Show success notification
      if (res.data?.success) {
        setLastPayment(res.data.data || null);
        Swal.fire({
          title: "Payment Successful",
          text: res.data.message || "Your payment was processed successfully.",
          icon: "success",
          confirmButtonColor: "#5B7E57",
        });
      }
      setErrors({});
      if (saveCard) {
        // Refresh saved cards list so the new card appears below
        loadSavedCards();
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Payment failed");
    }
    setLoading(false);
  };

  return (
    <div className="w-screen min-h-screen bg-[#DDE5D8] font-sans px-4 md:px-8 py-8 flex flex-col items-stretch">
      {/* Payment Method Tabs */}
      {/* Modern tab bar using divs, highlight, and no button look */}
      <div className="flex justify-center mb-8">
        <div className="relative flex bg-[#E6EFE2] rounded-full shadow-sm w-fit">
          <div
            className={`px-8 py-2 cursor-pointer font-semibold text-center transition-all duration-200 rounded-full z-10 ${
              tab === "card"
                ? "text-white" 
                : "text-[#5B7E57] hover:text-[#4f6d4b]"
            }`}
            style={{ position: "relative" }}
            onClick={() => setTab("card")}
          >
            Card Payment
            {tab === "card" && (
              <div className="absolute left-0 right-0 bottom-0 h-full bg-[#5B7E57] rounded-full -z-10 transition-all duration-200"></div>
            )}
          </div>
          <div
            className={`px-8 py-2 cursor-pointer font-semibold text-center transition-all duration-200 rounded-full z-10 ${
              tab === "insurance"
                ? "text-white" 
                : "text-[#5B7E57] hover:text-[#4f6d4b]"
            }`}
            style={{ position: "relative" }}
            onClick={() => setTab("insurance")}
          >
            Insurance
            {tab === "insurance" && (
              <div className="absolute left-0 right-0 bottom-0 h-full bg-[#5B7E57] rounded-full -z-10 transition-all duration-200"></div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-y-8 md:gap-y-0 md:gap-x-8 flex-1">
        {/* Left Frame - Payment Form (Card or Insurance) */}
        <div className="w-full md:w-1/2 flex-1 flex flex-col bg-white p-6 md:p-12 max-h-[700px] overflow-auto my-0">
          {tab === "card" ? (
            <>
              <h2 className="text-2xl font-bold mb-8">Provide Your Information</h2>
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={card.cardNumber}
                    onChange={handleChange}
                    placeholder="Enter card number"
                    className={`w-full p-2 border-2 rounded-sm ${
                      errors.cardNumber ? "border-red-500" : "border-gray-400"
                    }`}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Card Owner</label>
                  <input
                    type="text"
                    name="cardOwner"
                    value={card.cardOwner}
                    onChange={handleChange}
                    placeholder="Enter cardholder name"
                    className={`w-full p-2 border-2 rounded-sm ${
                      errors.cardOwner ? "border-red-500" : "border-gray-400"
                    }`}
                  />
                  {errors.cardOwner && (
                    <p className="text-red-600 text-xs mt-1">{errors.cardOwner}</p>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">CVC</label>
                    <input
                      type="text"
                      name="cvc"
                      value={card.cvc}
                      onChange={handleChange}
                      placeholder="123"
                      className={`w-full p-2 border-2 rounded-sm ${
                        errors.cvc ? "border-red-500" : "border-gray-400"
                      }`}
                    />
                    {errors.cvc && (
                      <p className="text-red-600 text-xs mt-1">{errors.cvc}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Expiry Date</label>
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <input
                          type="text"
                          name="expiryMM"
                          placeholder="MM"
                          value={card.expiryMM}
                          onChange={handleChange}
                          className={`w-full p-2 border-2 rounded-sm ${
                            errors.expiryMM ? "border-red-500" : "border-gray-400"
                          }`}
                        />
                        {errors.expiryMM && (
                          <p className="text-red-600 text-xs mt-1">{errors.expiryMM}</p>
                        )}
                      </div>
                      <div className="w-1/2">
                        <input
                          type="text"
                          name="expiryYY"
                          placeholder="YY"
                          value={card.expiryYY}
                          onChange={handleChange}
                          className={`w-full p-2 border-2 rounded-sm ${
                            errors.expiryYY ? "border-red-500" : "border-gray-400"
                          }`}
                        />
                        {errors.expiryYY && (
                          <p className="text-red-600 text-xs mt-1">{errors.expiryYY}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <input
                    id="saveCard"
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="saveCard" className="text-sm select-none">
                    Save this card for future payments
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#5B7E57] hover:bg-[#4f6d4b] text-white font-semibold py-2 rounded-sm mt-4"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Make Payment"}
                </button>
                {msg && (
                  <p className="text-center text-sm font-semibold text-green-700 mt-2">{msg}</p>
                )}
                {lastPayment && (
                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      className="bg-[#5B7E57] hover:bg-[#4f6d4b] text-white font-semibold px-4 py-2 rounded-sm"
                      onClick={() => {
                        try {
                          const doc = new jsPDF();
                          const yStart = 20;
                          doc.setFontSize(18);
                          doc.text("Payment Receipt", 105, 15, { align: "center" });
                          doc.setFontSize(12);
                          let y = yStart;
                          const rows = [
                            ["Appointment", "Dr Kusalya Widanagama - X-Ray Scanning"],
                            ["Transaction ID", String(lastPayment.transactionId || "-")],
                            ["Payment Method", "Card"],
                            ["Amount", String(lastPayment.amount != null ? lastPayment.amount : "-")],
                            ["Status", String(lastPayment.status || "-")],
                            ["Date", new Date(lastPayment.timestamp || Date.now()).toLocaleString()],
                          ];
                          rows.forEach(([label, value]) => {
                            doc.text(`${label}:`, 20, y);
                            doc.text(String(value), 70, y);
                            y += 10;
                          });
                          doc.save(`receipt_${lastPayment.transactionId || Date.now()}.pdf`);
                        } catch (e) {
                          Swal.fire({ title: "Error", text: "Failed to generate receipt", icon: "error" });
                        }
                      }}
                    >
                      Download Receipt (PDF)
                    </button>
                  </div>
                )}
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-8">Provide Your Information</h2>
              <form className="w-full space-y-4" onSubmit={handleInsuranceSubmit}>
                <div>
                  <label className="block text-sm font-semibold mb-1">Policy Number</label>
                  <input
                    type="text"
                    name="policyNumber"
                    value={insurance.policyNumber}
                    onChange={handleInsuranceChange}
                    placeholder="Enter policy number"
                    className="w-full p-2 border-2 rounded-sm border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    name="provider"
                    value={insurance.provider}
                    onChange={handleInsuranceChange}
                    placeholder="Enter provider name"
                    className="w-full p-2 border-2 rounded-sm border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Insured Name</label>
                  <input
                    type="text"
                    name="insuredName"
                    value={insurance.insuredName}
                    onChange={handleInsuranceChange}
                    placeholder="Enter insured person's name"
                    className="w-full p-2 border-2 rounded-sm border-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#5B7E57] hover:bg-[#4f6d4b] text-white font-semibold py-2 rounded-sm mt-4"
                  disabled={insuranceLoading}
                >
                  {insuranceLoading ? "Processing..." : "Submit Insurance Payment"}
                </button>
                {lastInsurancePayment && (
                  <div className="flex justify-center mt-3">
                    <button
                      type="button"
                      className="bg-[#5B7E57] hover:bg-[#4f6d4b] text-white font-semibold px-4 py-2 rounded-sm"
                      onClick={() => {
                        try {
                          const doc = new jsPDF();
                          const yStart = 20;
                          doc.setFontSize(18);
                          doc.text("Insurance Payment Receipt", 105, 15, { align: "center" });
                          doc.setFontSize(12);
                          let y = yStart;
                          const rows = [
                            ["Appointment", "Dr Kusalya Widanagama - X-Ray Scanning"],
                            ["Transaction ID", String(lastInsurancePayment.transactionId || "-")],
                            ["Policy Number", lastInsurancePayment.policyNumber],
                            ["Provider", lastInsurancePayment.provider],
                            ["Insured Name", lastInsurancePayment.insuredName],
                            ["Status", String(lastInsurancePayment.status || "-")],
                            ["Date", new Date(lastInsurancePayment.timestamp || Date.now()).toLocaleString()],
                          ];
                          rows.forEach(([label, value]) => {
                            doc.text(`${label}:`, 20, y);
                            doc.text(String(value), 70, y);
                            y += 10;
                          });
                          doc.save(`insurance_receipt_${lastInsurancePayment.transactionId || Date.now()}.pdf`);
                        } catch (e) {
                          Swal.fire({ title: "Error", text: "Failed to generate receipt", icon: "error" });
                        }
                      }}
                    >
                      Download Receipt (PDF)
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </div>

        {/* Right Frame - Appointment */}
        <div className="w-full md:w-1/2 flex-1 flex flex-col bg-[#BFD6B8] p-6 md:p-12 max-h-[700px] overflow-auto my-0">
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-3">Appointment</h3>
          <div className="flex justify-between mb-1">
            <span>Dr Kusalya Widanagama</span>
            <span>5000.00</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>X-Ray Scanning</span>
            <span>7500.00</span>
          </div>
          <hr className="border-gray-500 my-3" />
          <div className="flex justify-between font-bold">
            <span>Total Amount</span>
            <span>12500.00</span>
          </div>
        </div>
      </div>
      </div>
      {/* Saved Cards Frame (only show for Card tab) */}
      {tab === "card" && (
        <div className="mt-8 bg-[#BFD6B8] rounded-lg shadow p-6 max-w-3xl w-full mx-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Saved Card Details</h3>
          {cardsLoading ? (
            <p className="text-gray-700 italic">Loading saved cards...</p>
          ) : cardsError ? (
            <p className="text-red-700 italic">{cardsError}</p>
          ) : savedCards.length === 0 ? (
            <p className="text-gray-700 italic">No saved cards yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {savedCards.map((c, idx) => (
                <div
                  key={c.cardOwner + c.last4 + idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectSavedCard(c)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSelectSavedCard(c);
                  }}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-[#5B7E57] cursor-pointer transition"
                >
                  <div className="flex items-center text-gray-800">
                    <span className="font-mono tracking-widest">•••• {c.last4}</span>
                    <span className="ml-3 font-medium">{c.cardOwner}</span>
                    {c.expiryMM && c.expiryYY && (
                      <span className="ml-4 text-sm text-gray-600">Exp {c.expiryMM}/{c.expiryYY}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ml-4 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    onClick={(e) => { e.stopPropagation(); handleDeleteSavedCard(c); }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
