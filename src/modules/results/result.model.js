const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Result must belong to an exam"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Result must belong to a student"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

resultSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);