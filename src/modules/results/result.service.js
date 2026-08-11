const Result = require("./result.model");
const Exam = require("../exam/exam.model");
const Student = require("../student/student.model");
const Teacher = require("../teacher/teacher.model");
const Parent = require("../parent/parent.model");
const Group = require("../group/group.model");
const Secretary = require("../secretaries/secretary.model");

const ApiError = require("../../utils/ApiErrors");

const getStaffAssociatedTeacherId = async (user) => {
    if (user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id || user.id });
        if (!teacher) throw new ApiError("Teacher profile not found", 404);
        return teacher._id;
    } else if (user.role === "secretary") {
        const secretary = await Secretary.findOne({ userId: user._id || user.id });
        if (!secretary || !secretary.teacher) {
            throw new ApiError("Secretary is not linked to any valid teacher", 400);
        }
        return secretary.teacher;
    }
    return null;
};

const verifyExamOwnership = async (examId, user) => {
  const exam = await Exam.findById(examId);
  if (!exam) throw new ApiError("Exam not found", 404);

  if (user.role === "admin") return exam;

  const associatedTeacherId = await getStaffAssociatedTeacherId(user);

  if (!associatedTeacherId || exam.teacher.toString() !== associatedTeacherId.toString()) {
    throw new ApiError("Not authorized to manage results for this exam", 403);
  }

  return exam;
};

exports.createResult = async (data, user) => {
  const exam = await verifyExamOwnership(data.exam, user);

  const student = await Student.findOne({ studentCode: data.studentCode, isActive: true });
  if (!student) {
    throw new ApiError("Active student not found with this code", 404);
  }

  const associatedTeacherId = await getStaffAssociatedTeacherId(user);

  const isDirectTeacher = student.teacher && student.teacher.toString() === associatedTeacherId.toString();

  const isGroupTeacher = await Group.exists({
    _id: { $in: student.groups || [] },
    teacherId: associatedTeacherId,
  });

  if (!isDirectTeacher && !isGroupTeacher) {
    throw new ApiError("This student does not belong to the teacher associated with this exam", 403);
  }

  if (data.marks > exam.totalMarks) {
    throw new ApiError(`Marks cannot exceed the exam's total marks (${exam.totalMarks})`, 400);
  }

  const isPassed = data.marks >= exam.passingMarks;

  try {
    return await Result.create({
      exam: data.exam,
      student: student._id,
      marks: data.marks,
      isPassed,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError("Result already exists for this student in this exam", 400);
    }
    throw error;
  }
};

exports.getAllResults = async (user) => {
  let filter = {};

  if (user.role === "teacher" || user.role === "secretary") {
    const teacherId = await getStaffAssociatedTeacherId(user);
    if (!teacherId) return [];

    const teacherExams = await Exam.find({ teacher: teacherId }).select("_id");
    const examIds = teacherExams.map((e) => e._id);
    filter = { exam: { $in: examIds } };
  } 
  else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    filter = { student: student._id };
  } 
  else if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id });
    if (!parent || !parent.students || parent.students.length === 0) return [];

    filter = { student: { $in: parent.students } };
  }

  return await Result.find(filter)
    .populate("exam", "title totalMarks passingMarks")
    .populate({ path: "student", select: "studentCode", populate: { path: "userId", select: "name" } })
    .sort("-createdAt")
    .lean();
};

exports.getResultsByStudentCode = async (studentCode, user) => {
  const student = await Student.findOne({ studentCode }).lean();
  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  if (user.role === "student") {
    if (student.userId.toString() !== (user._id || user.id).toString()) {
      throw new ApiError("You can only view your own results", 403);
    }
  } 
  else if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id });
    if (!parent) throw new ApiError("Parent profile not found", 404);

    const isChild = parent.students.some(sId => sId.toString() === student._id.toString());
    if (!isChild) {
      throw new ApiError("You can only view results for your own children", 403);
    }
  }

  return await Result.find({ student: student._id })
    .populate("exam", "title examDate totalMarks passingMarks")
    .sort("-createdAt")
    .lean();
};

exports.getResultById = async (id, user) => {
  const result = await Result.findById(id)
    .populate("exam")
    .populate({ path: "student", populate: { path: "userId", select: "name" } })
    .lean();

  if (!result) throw new ApiError("Result not found", 404);

  if (user.role === "teacher" || user.role === "secretary") {
    await verifyExamOwnership(result.exam._id, user);
  } 
  else if (user.role === "student") {
      if (result.student.userId.toString() !== (user._id || user.id).toString()) {
          throw new ApiError("Not authorized", 403);
      }
  }

  return result;
};

exports.updateResult = async (id, data, user) => {
  const existing = await Result.findById(id);
  if (!existing) throw new ApiError("Result not found", 404);

  const examId = existing.exam;
  const exam = await verifyExamOwnership(examId, user);

  const marks = data.marks !== undefined ? data.marks : existing.marks;
  if (marks > exam.totalMarks) {
    throw new ApiError(`Marks cannot exceed the exam's total marks (${exam.totalMarks})`, 400);
  }

  data.isPassed = marks >= exam.passingMarks;

  return await Result.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
};

exports.deleteResult = async (id, user) => {
  const existing = await Result.findById(id);
  if (!existing) throw new ApiError("Result not found", 404);

  await verifyExamOwnership(existing.exam, user);

  return await Result.findByIdAndDelete(id).lean();
};

exports.getResultsByExam = async (examId, user) => {
  await verifyExamOwnership(examId, user);

  return await Result.find({ exam: examId })
    .populate({ path: "student", select: "studentCode", populate: { path: "userId", select: "name" } })
    .sort("-createdAt")
    .lean();
};