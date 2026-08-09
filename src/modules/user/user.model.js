const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: [3, "name is too short"],
      maxLength: [100, "name is too long"],
      required: [true, "name is required"],
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
      unique: true,
      trim: true,
    },
    email: { type: String, unique: true, sparse: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password is too short"],
      maxLength: [100, "password is too long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent", "secretary"],
      default: "student",
      required: [true, "role is required"],
    },
    profileImage: {
      type: String,
      default: "default.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: { type: Date },
    passwordResetCode: { type: String },
    passwordResetExpires: { type: Date },
    passwordResetVerified: { type: Boolean },
    // Removed unused reverse-reference fields (parent/student/teacher).
    // The link is always looked up the other way: Teacher.userId, Student.userId,
    // Parent.user — these were never populated and would silently read as empty.
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;