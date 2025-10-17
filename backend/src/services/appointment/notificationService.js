// server/src/services/appointment/notificationService.js
// Single file that handles: immediate notifications, reminder queueing, and the background worker

const Notification = require("../../models/notificationModel");

/**
 * Send a notification now.
 * Supports BOTH signatures for convenience:
 *   sendNotification(userId, message)
 *   sendNotification(userId, title, message)
 */
async function sendNotification(userId, a, b) {
  try {
    const hasTitle = typeof b === "string";
    const title = hasTitle ? a : "Notification";
    const message = hasTitle ? b : a;

    // TODO: integrate email/SMS provider here
    console.log(`📩 Notification to User(${userId}): ${title} - ${message}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
    return false;
  }
}

/**
 * Queue a reminder 24 hours before the given appointment date.
 * - appointmentId: ObjectId/string (for reference only)
 * - userId: ObjectId/string
 * - date: Date | ISO string (the appointment start time)
 */
async function queueReminder24h(appointmentId, userId, date) {
  const when = (d) => (d instanceof Date ? d : new Date(d));
  const apptDate = when(date);
  const runAt = new Date(apptDate.getTime() - 24 * 60 * 60 * 1000);

  await Notification.create({
    userId,
    message: `Reminder: Appointment at ${apptDate.toISOString()}`,
    runAt,
    // you could also store appointmentId in meta if you want:
    // meta: { appointmentId }
  });
}

/**
 * Simple in-process worker:
 * every minute, find due notifications (runAt <= now && not sent),
 * send them, and mark as sent.
 */
function startNotificationWorker() {
  setInterval(async () => {
    try {
      const now = new Date();
      const due = await Notification.find({
        sentAt: null,
        runAt: { $lte: now },
      }).limit(20);

      for (const n of due) {
        try {
          await sendNotification(n.userId, n.message);
          n.sentAt = new Date();
          await n.save();
        } catch (e) {
          console.error("[notificationWorker] send failed", n._id, e.message);
        }
      }
    } catch (e) {
      console.error("[notificationWorker] tick error", e.message);
    }
  }, 60 * 1000);
}

module.exports = {
  sendNotification,
  queueReminder24h,
  startNotificationWorker,
};
