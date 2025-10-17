const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    runAt: { type: Date, required: true },
    sentAt: { type: Date }, // null if pending
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
