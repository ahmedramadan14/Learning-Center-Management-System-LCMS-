const mongoose = require("mongoose");
const validator = require("validator");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true, 
    },
    studentCode: {
      type: String,
      required: [true, "Student code is required"],
      unique: true,
      trim: true,
    },
    parentPhone: {
      type: String,
      required: [true, "Parent phone is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female"],
        message: "Gender must be either male or female",
      },
      required: [true, "Gender is required"],
    },
    grade: {
      type: String,
      required: [true, "Grade/Educational stage is required"],
      trim: true,
      // enum: ["1st_sec", "2nd_sec", "3rd_sec"] 
    },
    birthDate: {
      type: Date,
    },
    // groups: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Group",
    //   },
    // ],
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

 //   examresults: [mongoose.Schema.Types.ObjectId , ref:"ExamResults"], // ref -> examresults
//   payments: [mongoose.Schema.Types.ObjectId , ref:"Payment"], // ref -> payments // create table for M to M relationship
//   studentgroup: [mongoose.Schema.Types.ObjectId , ref:"StudentGroups"], // ref -> studentgroups
//   attendances: [mongoose.Schema.Types.ObjectId , ref:"Attendance"], // ref -> attendances

  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;

