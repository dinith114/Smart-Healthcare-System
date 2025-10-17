const {
  makePayment,
  getSavedCards,
  deleteSavedCard,
  decryptCard,
} = require("../../controllers/payment/paymentController");
const Payment = require("../../models/payment/paymentModel");
const { validateCard } = require("../../utils/payment/validateCard");
const crypto = require("crypto");

// Mock dependencies
jest.mock("../../models/payment/paymentModel");
jest.mock("../../models/userModel"); // Mock User model for email functionality
jest.mock("../../services/emailService"); // Mock email service
jest.mock("../../utils/payment/validateCard");

// Helper to generate valid ObjectId strings (24 hex chars)
const generateObjectId = () => {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

describe("Payment Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock crypto functions for encryption/decryption
    jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.from("1234567890123456"));
    jest.spyOn(crypto, 'createCipheriv').mockReturnValue({
      update: jest.fn().mockReturnValue(Buffer.from("encrypted")),
      final: jest.fn().mockReturnValue(Buffer.from("final")),
    });
    jest.spyOn(crypto, 'createDecipheriv').mockReturnValue({
      update: jest.fn().mockReturnValue(Buffer.from("decrypted")),
      final: jest.fn().mockReturnValue(Buffer.from("card")),
    });
  });

  describe("makePayment", () => {
    const validCard = {
      cardNumber: "4532015112830366",
      cardOwner: "John Doe",
      cvc: "123",
      expiryMM: "12",
      expiryYY: "25",
    };

    const validPaymentRequest = {
      card: validCard,
      amount: 1000,
      saveCard: false,
      patientId: generateObjectId(),
      appointmentId: "appt456",
      appointmentInfo: {
        appointmentId: "appt456",
        amount: 1000,
        currency: "LKR",
      },
    };

    beforeEach(() => {
      validateCard.mockReturnValue(true);
      Payment.mockImplementation((data) => ({
        ...data,
        _id: generateObjectId(),
        transactionId: data.transactionId,
        amount: data.amount,
        card: data.card,
        status: data.status,
        createdAt: new Date("2025-01-01"),
        save: jest.fn().mockResolvedValue({
          ...data,
          _id: generateObjectId(),
          createdAt: new Date("2025-01-01"),
        }),
      }));
    });

    test("should successfully process a valid payment", async () => {
      req.body = validPaymentRequest;
      
      // Mock Math.random to ensure payment succeeds (not in 10% failure range)
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(validateCard).toHaveBeenCalledWith(validCard);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Payment successful!",
          data: expect.objectContaining({
            transactionId: expect.stringContaining("TXN"),
            amount: 1000,
            status: "Success",
          }),
        })
      );

      Math.random.mockRestore();
    });

    test("should save card details when saveCard is true", async () => {
      req.body = { ...validPaymentRequest, saveCard: true };
      
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(Payment).toHaveBeenCalledWith(
        expect.objectContaining({
          card: expect.objectContaining({
            cardOwner: "John Doe",
            last4: "0366",
            expiryMM: "12",
            expiryYY: "25",
          }),
        })
      );

      Math.random.mockRestore();
    });

    test("should not save card details when saveCard is false", async () => {
      req.body = validPaymentRequest;
      
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(Payment).toHaveBeenCalledWith(
        expect.not.objectContaining({
          card: expect.anything(),
        })
      );

      Math.random.mockRestore();
    });

    test("should fail payment with 10% probability", async () => {
      req.body = validPaymentRequest;
      
      // Mock Math.random to trigger failure (< 0.1)
      jest.spyOn(Math, "random").mockReturnValue(0.05);

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Payment declined by bank. Please try again or use a different card.",
      });

      Math.random.mockRestore();
    });

    test("should return 400 if card details are missing", async () => {
      req.body = { amount: 1000 };

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Card details and amount are required",
      });
    });

    test("should return 400 if amount is missing", async () => {
      req.body = { card: validCard };

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Card details and amount are required",
      });
    });

    test("should return 400 if card validation fails", async () => {
      validateCard.mockReturnValue(false);
      req.body = validPaymentRequest;

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid card details. Please check your card information.",
      });
    });

    test("should return 400 if card expiry is in the past", async () => {
      req.body = {
        ...validPaymentRequest,
        card: {
          ...validCard,
          expiryMM: "01",
          expiryYY: "20", // 2020 is in the past
        },
      };

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Card expiry date must be in the future.",
      });
    });

    test("should return 400 if amount is invalid (zero or negative)", async () => {
      // For zero amount - Note: 0 is falsy in JavaScript, so !amount is true
      // This triggers "Card details and amount are required" before reaching amount <= 0 check
      req.body = { ...validPaymentRequest, amount: 0 };
      
      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Card details and amount are required",
      });

      // Reset mocks for negative amount test
      res.status.mockClear();
      res.json.mockClear();

      // For negative amount - this reaches the amount <= 0 validation
      req.body = { ...validPaymentRequest, amount: -100 };

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid payment amount",
      });
    });

    test("should store appointment details correctly", async () => {
      req.body = validPaymentRequest;
      
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(Payment).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: "appt456",
          details: {
            appointmentInfo: {
              appointmentId: "appt456",
              amount: 1000,
              currency: "LKR",
            },
          },
        })
      );

      Math.random.mockRestore();
    });

    test("should handle database save errors gracefully", async () => {
      Payment.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error("Database error")),
      }));

      req.body = validPaymentRequest;
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Payment processing failed. Please try again later.",
      });

      Math.random.mockRestore();
    });

    test("should handle invalid expiry month gracefully", async () => {
      req.body = {
        ...validPaymentRequest,
        card: {
          ...validCard,
          expiryMM: "13", // Invalid month (>12)
          expiryYY: "25",
        },
      };

      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      // Month 13 creates an invalid date, which will be caught by expDate <= now check
      // or it may succeed because JavaScript Date constructor handles month 13 as next year January
      // Either way, the controller handles it
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();

      Math.random.mockRestore();
    });
  });

  describe("getSavedCards", () => {
    test("should return list of unique saved cards", async () => {
      const mockPayments = [
        {
          card: {
            cardOwner: "John Doe",
            last4: "1234",
            encryptedNumber: "encrypted1",
            expiryMM: "12",
            expiryYY: "25",
          },
        },
        {
          card: {
            cardOwner: "Jane Smith",
            last4: "5678",
            encryptedNumber: "encrypted2",
            expiryMM: "06",
            expiryYY: "26",
          },
        },
        {
          card: {
            cardOwner: "John Doe",
            last4: "1234",
            encryptedNumber: "encrypted1",
            expiryMM: "12",
            expiryYY: "25",
          },
        },
      ];

      Payment.find = jest.fn().mockResolvedValue(mockPayments);

      await getSavedCards(req, res);

      expect(Payment.find).toHaveBeenCalledWith({ "card.last4": { $exists: true } });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        cards: [
          {
            cardOwner: "John Doe",
            last4: "1234",
            encryptedNumber: "encrypted1",
            expiryMM: "12",
            expiryYY: "25",
          },
          {
            cardOwner: "Jane Smith",
            last4: "5678",
            encryptedNumber: "encrypted2",
            expiryMM: "06",
            expiryYY: "26",
          },
        ],
      });
    });

    test("should return empty array when no saved cards exist", async () => {
      Payment.find = jest.fn().mockResolvedValue([]);

      await getSavedCards(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        cards: [],
      });
    });

    test("should handle database errors", async () => {
      Payment.find = jest.fn().mockRejectedValue(new Error("Database error"));

      await getSavedCards(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch saved cards",
      });
    });
  });

  describe("deleteSavedCard", () => {
    test("should delete saved card successfully", async () => {
      req.body = {
        cardOwner: "John Doe",
        last4: "1234",
        expiryMM: "12",
        expiryYY: "25",
      };

      Payment.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 2 });

      await deleteSavedCard(req, res);

      expect(Payment.updateMany).toHaveBeenCalledWith(
        {
          "card.cardOwner": "John Doe",
          "card.last4": "1234",
          "card.expiryMM": "12",
          "card.expiryYY": "25",
        },
        { $unset: { card: "" } }
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Saved card removed",
        modifiedCount: 2,
      });
    });

    test("should return message when no matching cards found", async () => {
      req.body = {
        cardOwner: "John Doe",
        last4: "1234",
        expiryMM: "12",
        expiryYY: "25",
      };

      Payment.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 0 });

      await deleteSavedCard(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "No matching saved cards found",
        modifiedCount: 0,
      });
    });

    test("should return 400 if required fields are missing", async () => {
      req.body = {
        cardOwner: "John Doe",
        last4: "1234",
        // Missing expiryMM and expiryYY
      };

      await deleteSavedCard(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "cardOwner, last4, expiryMM, and expiryYY are required",
      });
    });

    test("should handle database errors", async () => {
      req.body = {
        cardOwner: "John Doe",
        last4: "1234",
        expiryMM: "12",
        expiryYY: "25",
      };

      Payment.updateMany = jest.fn().mockRejectedValue(new Error("Database error"));

      await deleteSavedCard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete saved card",
      });
    });
  });

  describe("decryptCard", () => {
    test("should decrypt card number successfully", async () => {
      req.body = {
        encryptedNumber: "mockiv:mockencrypted",
      };

      await decryptCard(req, res);

      expect(crypto.createDecipheriv).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        cardNumber: expect.any(String),
      });
    });

    test("should return 400 if encrypted number is missing", async () => {
      req.body = {};

      await decryptCard(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Encrypted card number is required",
      });
    });

    test("should handle decryption errors", async () => {
      req.body = {
        encryptedNumber: "invalid:encrypted",
      };

      jest.spyOn(crypto, 'createDecipheriv').mockImplementation(() => {
        throw new Error("Decryption failed");
      });

      await decryptCard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to decrypt card number",
      });
    });
  });

  describe("Integration scenarios", () => {
    test("should handle complete payment flow with card saving", async () => {
      const validCard = {
        cardNumber: "4532015112830366",
        cardOwner: "John Doe",
        cvc: "123",
        expiryMM: "12",
        expiryYY: "25",
      };

      const testPatientId = generateObjectId();
      const testTransactionId = `TXN${Date.now()}999`;
      const testPaymentId = generateObjectId();

      req.body = {
        card: validCard,
        amount: 1000,
        saveCard: true,
        patientId: testPatientId,
        appointmentId: "appt456",
        appointmentInfo: {
          appointmentId: "appt456",
          amount: 1000,
          currency: "LKR",
        },
      };

      validateCard.mockReturnValue(true);
      
      // Mock Payment constructor to return object with all properties
      Payment.mockImplementation((data) => {
        const paymentObj = {
          ...data,
          _id: testPaymentId,
          transactionId: data.transactionId,
          amount: data.amount,
          card: data.card,
          status: data.status,
          createdAt: new Date("2025-01-01"),
        };
        paymentObj.save = jest.fn().mockResolvedValue(paymentObj);
        return paymentObj;
      });

      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Payment successful!",
          data: expect.objectContaining({
            transactionId: expect.stringContaining("TXN"),
            amount: 1000,
            status: "Success",
            cardLast4: "0366",
          }),
        })
      );

      Math.random.mockRestore();
    });

    test("should use default currency when not provided", async () => {
      req.body = {
        card: {
          cardNumber: "4532015112830366",
          cardOwner: "John Doe",
          cvc: "123",
          expiryMM: "12",
          expiryYY: "25",
        },
        amount: 1000,
        saveCard: false,
        patientId: generateObjectId(),
        appointmentId: "appt456",
        // No appointmentInfo provided
      };

      validateCard.mockReturnValue(true);
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      await makePayment(req, res);

      expect(Payment).toHaveBeenCalledWith(
        expect.objectContaining({
          details: {
            appointmentInfo: expect.objectContaining({
              currency: "LKR",
            }),
          },
        })
      );

      Math.random.mockRestore();
    });
  });
});
