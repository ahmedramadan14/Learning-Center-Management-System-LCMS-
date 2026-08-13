const mongoose = require("mongoose");

// A receipt belongs to one user and one notification. Keeping receipts in a
// dedicated collection makes read state durable across browsers/devices and
// prevents one recipient's state from being exposed to another recipient.
const notificationReadReceiptSchema = new mongoose.Schema(
  {
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

notificationReadReceiptSchema.index(
  { notification: 1, user: 1 },
  { unique: true }
);
notificationReadReceiptSchema.index({ user: 1, notification: 1 });

const NotificationReadReceipt =
  mongoose.models.NotificationReadReceipt ||
  mongoose.model("NotificationReadReceipt", notificationReadReceiptSchema);

module.exports = NotificationReadReceipt;
