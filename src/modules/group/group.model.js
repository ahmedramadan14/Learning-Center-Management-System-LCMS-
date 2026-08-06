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
      required: [true, "Max capacity is required"],
      min: 1,
    },

    monthlyFee: {
      type: Number,
      required: [true, "Monthly fee is required"],
      min: 0,
    },

    billingAnchorDate: {
      type: Date,
    },

    sessionsPerCycle: {
      type: Number,
      required: [true, "Sessions per cycle is required"],
      min: 1,
    },

    exams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
    ],

    paperexams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PaperExam",
      },
    ],

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },

    gradelevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
    },

    studentgroup: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentGroup",
      },
    ],

    groupschedule: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
      },
    ],

    attendance_sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttendanceSession",
      },
    ],

    attendances: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attendance",
      },
    ],

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);