const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Group is required"],
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    dayOfWeek: {
      type: Number,
      required: [true, "Day of week is required"],
      min: 0,
      max: 6,
    },

    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["weekly", "extra"],
    },

    specificDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);