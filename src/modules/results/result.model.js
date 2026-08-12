const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Result must belong to an exam"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Result must belong to a student"],
    },
    marks: {
      type: Number,
      required: [true, "Marks is required"],
      min: [0, "Marks cannot be negative"],
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

resultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);