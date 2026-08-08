const mongoose = require("mongoose");

// Fixed: no trailing spaces in enums
const NOTIFICATION_TYPES = ["announcement", "payment", "exam", "attendance"];
const TARGET_ROLES = ["all", "students", "parents", "teachers"];

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required."],
      trim: true,
      minlength: [3, "title must be at least 3 characters."],
      maxlength: [150, "title cannot exceed 150 characters."],
    },
    body: {
      type: String,
      required: [true, "body is required."],
      trim: true,
      minlength: [1, "body cannot be empty."],
      maxlength: [2000, "body cannot exceed 2000 characters."],
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "announcement",
      index: true,
    },
    targetRole: {
      type: String,
      enum: TARGET_ROLES,
      default: "all",
      index: true,
    },
    targetUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ targetRole: 1, type: 1, createdAt: -1 });

// Remove duplicate target user ids before saving
notificationSchema.pre("validate", function removeDuplicateTargets() {
  if (!Array.isArray(this.targetUserIds)) {
    return;
  }
  this.targetUserIds = [
    ...new Map(this.targetUserIds.map((id) => [id.toString(), id])).values(),
  ];
});

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

module.exports = Notification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
module.exports.TARGET_ROLES = TARGET_ROLES;