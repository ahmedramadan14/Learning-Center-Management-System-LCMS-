const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
    },
    description: {
      type: String,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true 
  }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;