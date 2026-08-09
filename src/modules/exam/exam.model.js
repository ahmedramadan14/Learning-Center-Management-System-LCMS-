const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: [true, "Exam must belong to a group"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Exam must have a teacher"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
      min: [1, "Total marks must be at least 1"],
    },
    passingMarks: {
  type: Number,
  required: [true, "Passing marks is required"],
  min: [0, "Passing marks cannot be negative"],
  validate: {
    validator: function (value) {
      if (this.getUpdate) {
        const update = this.getUpdate();
        const total = update.totalMarks || update.$set?.totalMarks;
        if (total !== undefined) return value <= total;
        return true; 
      }
      return this.totalMarks === undefined || value <= this.totalMarks;
    },
    message: "Passing marks cannot exceed total marks",
  },
},
 examDate: {
  type: Date,
  required: [true, "Exam date is required"],
  set: (val) => {
    if (!val) return val;
    const dateStr = typeof val === "string" ? val.split("T")[0] : new Date(val).toISOString().split("T")[0];
    return new Date(`${dateStr}T00:00:00.000Z`);
  },
},
    duration: {
      type: Number, // minutes
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);