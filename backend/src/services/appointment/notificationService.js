// src/services/notificationService.js
exports.sendNotification = async (userId, title, message) => {
  try {
    // You can later integrate an email/SMS API here.
    console.log(`📩 Notification to User(${userId}): ${title} - ${message}`);
    return true;
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
    return false;
  }
};
