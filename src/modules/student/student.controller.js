const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model");
const Group = require("../group/group.model");
const studentService = require("./student.service");
const asyncHandler = require("../../middlewares/asyncHandler");
const ApiError = require("../../utils/ApiErrors");

const getTeacherInfoFromUser = async (user) => {
  let teacherProfileId = null;
  let teacherUserId = null;

  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user.id || user._id });
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    teacherProfileId = teacher._id;
    teacherUserId = user.id || user._id;
  } else if (user.role === "secretary") {
    const secretary = await Secretary.findOne({ userId: user.id || user._id }).populate("teacher");
    if (!secretary || !secretary.teacher) {
      throw new ApiError("Secretary is not linked to any valid teacher", 400);
    }
    teacherProfileId = secretary.teacher._id;
    teacherUserId = secretary.teacher.userId;
  }

  return { teacherProfileId, teacherUserId };
};

const createStudent = asyncHandler(async (req, res) => {
  let { teacherProfileId, teacherUserId } = await getTeacherInfoFromUser(req.user);

  if (req.user.role === "admin") {
    // Selecting a group is enough to determine its responsible teacher. This
    // keeps the student creation and later enrollment flows consistent.
    let teacherId = req.body.teacherId;
    if (!teacherId && req.body.groupId) {
      const group = await Group.findById(req.body.groupId).select("teacherId");
      if (!group) throw new ApiError("Group not found", 404);
      teacherId = group.teacherId;
    }

    if (!teacherId) throw new ApiError("Teacher ID is required when admin creates a student without a group", 400);
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) throw new ApiError("Teacher not found", 404);
    teacherProfileId = teacher._id;
    teacherUserId = teacher.userId;
  } else if (
    req.user.role === "teacher" &&
    req.body.teacherId &&
    req.body.teacherId.toString() !== teacherProfileId.toString()
  ) {
    throw new ApiError("Teachers can only create students for their own profile", 403);
  }

  const student = await studentService.createStudent({
    ...req.body,
    teacherProfileId,
    teacherUserId,
    createdById: req.user.id || req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Student created successfully and linked to teacher",
    data: student,
  });
});

const getStudents = asyncHandler(async (req, res) => {
  let { teacherProfileId } = await getTeacherInfoFromUser(req.user);

  if (req.user.role === "admin" && req.query.teacherId) {
    teacherProfileId = req.query.teacherId;
  }

  const students = await studentService.getAllStudents(
    teacherProfileId,
    req.query,
    req.user.role === "admin"
  );

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

const getStudentByCode = asyncHandler(async (req, res) => {
  const { studentCode } = req.body.studentCode ? req.body : req.params;
  const { teacherProfileId } = await getTeacherInfoFromUser(req.user);

  const student = await studentService.getStudentByCode(
    studentCode,
    teacherProfileId,
    req.user.role === "admin"
  );

  res.status(200).json({
    success: true,
    data: student,
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { studentCode } = req.params;
  const { teacherProfileId } = await getTeacherInfoFromUser(req.user);

  const updatedStudent = await studentService.updateStudentByCode(
    studentCode,
    req.body,
    teacherProfileId,
    req.user.role === "admin"
  );

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: updatedStudent,
  });
});

const deactivateStudent = asyncHandler(async (req, res) => {
  const { studentCode } = req.params;
  const { teacherProfileId } = await getTeacherInfoFromUser(req.user);

  await studentService.deactivateStudentByCode(
    studentCode,
    teacherProfileId,
    req.user.role === "admin"
  );

  res.status(200).json({
    success: true,
    message: "Student deactivated successfully",
  });
});

const activateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.activateStudentByCode(req.params.studentCode);

  res.status(200).json({
    success: true,
    message: "Student activated successfully",
    data: student,
  });
});

const getMyCode = asyncHandler(async (req, res, next) => {
  const studentCode = await studentService.getMyCode(req.user._id || req.user.id);

  res.status(200).json({
    success: true,
    data: {
      studentCode,
    },
  });
});

module.exports = {
  createStudent,
  getStudents,
  getStudentByCode,
  updateStudent,
  deactivateStudent,
  activateStudent,
  getMyCode,
};
