const mongoose = require("mongoose");
const Result = require("./result.model");
const Exam = require("../exam/exam.model");
const Student = require("../student/student.model");
const Teacher = require("../teacher/teacher.model");
const ParentStudent = require("../parentStudent/parentStudent.model");

exports.createResult = async (data, user) => {
  const exam = await Exam.findById(data.exam);
  if (!exam) {
    const error = new Error("Exam not found");
    error.statusCode = 404;
    throw error;
  }

  const student = await Student.findOne({ studentCode: data.studentCode, isActive: true });
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.marks > exam.totalMarks) {
    const error = new Error(`Marks cannot exceed the exam's total marks (${exam.totalMarks})`);
    error.statusCode = 400;
    throw error;
  }

  const isPassed = data.marks >= exam.passingMarks;
  return Result.create({
    exam: data.exam,
    student: student._id,
    marks: data.marks,
    isPassed,
  });
};

exports.getAllResults = async (user) => {
  let filter = {};

  if (user.role === "teacher" || user.role === "secretary") {
    const teacherUserId = user.role === "teacher" ? (user._id || user.id) : user.createdBy;
    const teacher = await Teacher.findOne({ userId: teacherUserId });
    if (!teacher) return [];

    const teacherExams = await Exam.find({ teacher: teacher._id }).select("_id");
    const examIds = teacherExams.map((e) => e._id);
    filter = { exam: { $in: examIds } };
  } else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    filter = { student: student._id };
  } else if (user.role === "parent") {
    const parentLinks = await ParentStudent.find({ parentUserId: user._id || user.id }).select("studentId");
    const studentIds = parentLinks.map((p) => p.studentId);
    filter = { student: { $in: studentIds } };
  }

  return Result.find(filter)
    .populate("exam", "title totalMarks passingMarks")
    .populate({ path: "student", select: "studentCode", populate: { path: "userId", select: "name" } })
    .sort("-createdAt")
    .lean();
};

exports.getResultsByStudentCode = async (studentCode, user) => {
  const student = await Student.findOne({ studentCode }).lean();
  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "student") {
    const currentStudent = await Student.findOne({ userId: user._id || user.id });
    if (currentStudent?._id.toString() !== student._id.toString()) {
      const error = new Error("You can only view your own results");
      error.statusCode = 403;
      throw error;
    }
  } else if (user.role === "parent") {
    const isChild = await ParentStudent.exists({ parentUserId: user._id || user.id, studentId: student._id });
    if (!isChild) {
      const error = new Error("You can only view results for your own children");
      error.statusCode = 403;
      throw error;
    }
  }

  return Result.find({ student: student._id })
    .populate("exam", "title examDate totalMarks passingMarks")
    .sort("-createdAt")
    .lean();
};

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
    if (marks > exam.totalMarks) {
      const error = new Error(`Marks cannot exceed the exam's total marks (${exam.totalMarks})`);
      error.statusCode = 400;
      throw error;
    }

    data.isPassed = marks >= exam.passingMarks;
  }

  return Result.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
};

exports.deleteResult = (id) => Result.findByIdAndDelete(id).lean();

exports.getResultsByExam = (examId) =>
  Result.find({ exam: examId })
    .populate({ path: "student", select: "studentCode", populate: { path: "userId", select: "name" } })
    .sort("-createdAt")
    .lean();