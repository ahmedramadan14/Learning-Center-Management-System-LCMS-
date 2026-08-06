const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Grade name is required"],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Grade = mongoose.model("Grade", gradeSchema);

module.exports = Grade;