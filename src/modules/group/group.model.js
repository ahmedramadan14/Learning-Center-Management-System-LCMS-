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
      min: 1,
    },

    monthlyFee: {
      type: Number,
      required: [true, "Monthly fee is required"],
      min: 0,
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

module.exports = mongoose.model("Group", groupSchema);