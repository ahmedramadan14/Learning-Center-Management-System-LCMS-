const Exam = require("./exam.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const ParentStudent = require("../parentStudent/parentStudent.model");
const Result = require("../results/result.model");


exports.createExam = async (data, user) => {
  const group = await Group.findById(data.group);
  if (!group) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  let teacherId;
  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) {
      const error = new Error("Teacher profile not found");
      error.statusCode = 404;
      throw error;
    }
    teacherId = teacher._id;
  } else if (user.role === "secretary") {
    const teacher = await Teacher.findOne({ userId: user.createdBy });
    if (!teacher) {
      const error = new Error("Associated Teacher not found for this secretary");
      error.statusCode = 404;
      throw error;
    }
    teacherId = teacher._id;
  } else if (user.role === "admin") {
    if (!data.teacher) {
      const error = new Error("Teacher ID is required for admin actions");
      error.statusCode = 400;
      throw error;
    }
    teacherId = data.teacher;
  }

  if (group.teacherId.toString() !== teacherId.toString()) {
    const error = new Error("You can only create exams for your own groups");
    error.statusCode = 403;
    throw error;
  }

  const examDateObj = new Date(data.examDate);
  examDateObj.setHours(0, 0, 0, 0);

  const existingExam = await Exam.findOne({
    group: data.group,
    examDate: examDateObj,
  });

  if (existingExam) {
    const error = new Error("This group already has an exam scheduled on this date");
    error.statusCode = 400;
    throw error;
  }

  delete data.status;
  return Exam.create({ ...data, teacher: teacherId, examDate: examDateObj });
};
exports.getAllExams = async (user) => {
  let filter = {};

  if (user.role === "teacher" || user.role === "secretary") {
    const teacherUserId = user.role === "teacher" ? (user._id || user.id) : user.createdBy;
    const teacher = await Teacher.findOne({ userId: teacherUserId });
    if (!teacher) return [];

    filter = { teacher: teacher._id };
  } else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];

    filter = { group: { $in: student.groups }, status: "published" };
  } else if (user.role === "parent") {
    const parentLinks = await ParentStudent.find({ parentUserId: user._id || user.id }).select("studentId");
    const studentIds = parentLinks.map((p) => p.studentId);
    const students = await Student.find({ _id: { $in: studentIds } }).select("groups");
    
    const groupIds = students.flatMap((s) => s.groups);
    filter = { group: { $in: groupIds }, status: "published" };
  }

const exams = await Exam.find(filter)
    .sort("-createdAt")
    .populate("group", "groupName")
    .lean();

  return exams.map((exam) => ({
    ...exam,
    examDate: exam.examDate ? exam.examDate.toISOString().split("T")[0] : null,
  }));
};

exports.getExamById = async (id, user) => {
  const exam = await Exam.findById(id).populate("group", "groupName").lean();
  if (!exam) return null;

  if (user.role === "student" && exam.status !== "published") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  return exam;
};

exports.updateExam = async (id, data) => {
  delete data.status; 

  const existing = await Exam.findById(id);
  if (!existing) return null;

  const totalMarks = data.totalMarks !== undefined ? data.totalMarks : existing.totalMarks;
  const passingMarks = data.passingMarks !== undefined ? data.passingMarks : existing.passingMarks;

  if (passingMarks > totalMarks) {
    const error = new Error("Passing marks cannot exceed total marks");
    error.statusCode = 400;
    throw error;
  }

  return Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
};
exports.deleteExam = async (id) => {
  const exam = await Exam.findById(id);
  if (!exam) return null;

  const hasResults = await Result.exists({ exam: id });
  if (hasResults) {
    const error = new Error("Cannot delete exam: results already exist for it");
    error.statusCode = 400;
    throw error;
  }

  return Exam.findByIdAndDelete(id).lean();
};

exports.publishExam = (id) =>
  Exam.findByIdAndUpdate(id, { status: "published" }, { new: true }).lean();