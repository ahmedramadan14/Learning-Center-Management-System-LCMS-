const mongoose = require("mongoose");
const Result = require("./result.model");
const Exam = require("../exam/exam.model");

// isPassed is computed here — never trust a client-sent value for it
exports.createResult = async (data) => {
  const exam = await Exam.findById(data.exam);
  if (!exam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  const isPassed = data.marks >= exam.passingMarks;
  return Result.create({ ...data, isPassed });
};

exports.getAllResults = () => Result.find().sort("-createdAt").lean();

exports.getResultById = (id) => Result.findById(id).lean();

exports.updateResult = async (id, data) => {
  if (data.marks !== undefined || data.exam !== undefined) {
    const existing = await Result.findById(id);
    if (!existing) return null;

    const examId = data.exam || existing.exam;
    const exam = await Exam.findById(examId);
    if (!exam) {
      const error = new Error("Exam not found");
      error.statusCode = 404;
      throw error;
    }

    const marks = data.marks !== undefined ? data.marks : existing.marks;
    data.isPassed = marks >= exam.passingMarks;
  }

  return Result.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
};

exports.deleteResult = (id) => Result.findByIdAndDelete(id).lean();

// getStudentResults — Ahmed's requirement: look up by studentCode, not ObjectId
exports.getResultsByStudentCode = async (studentCode) => {
  const Student = mongoose.model("Student"); // registered by the student module
  const student = await Student.findOne({ studentCode }).lean();

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  return Result.find({ student: student._id })
    .populate("exam", "title examDate totalMarks")
    .sort("-createdAt")
    .lean();
};

exports.getResultsByExam = (examId) =>
  Result.find({ exam: examId })
    .populate("student", "studentCode")
    .sort("-createdAt")
    .lean();