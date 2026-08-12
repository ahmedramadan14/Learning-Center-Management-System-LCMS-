const mongoose = require("mongoose");

const parentStudentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: [true, "Parent ID is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

parentStudentSchema.index({ parent: 1, student: 1 }, { unique: true });

module.exports = mongoose.models.ParentStudent || mongoose.model("ParentStudent", parentStudentSchema);