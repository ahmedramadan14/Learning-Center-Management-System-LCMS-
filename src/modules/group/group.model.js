const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    },
    gradeLevelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is required"],
    },
    maxCapacity: {
      type: Number,
      default: 30,
      min: [1, "Capacity must be at least 1"],
    },
    sessionPrice: {
      type: Number,
      required: [true, "Session price is required."],
      min: [0, "Session price cannot be negative."],
    },
    sessionsPerCycle: {
      type: Number,
      default: 8,
      min: 1,
    },
    billingAnchorDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ groupName: 1, teacherId: 1 }, { unique: true });

module.exports = mongoose.model("Group", groupSchema);