const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    paperExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaperExam",
      required: [true, "Exam must belong to a paper exam"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Exam must belong to a student"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Prevents duplicate exam records for the same student + paper exam
examSchema.index({ studentId: 1, paperExamId: 1 }, { unique: true });

module.exports = mongoose.model("Exam", examSchema);