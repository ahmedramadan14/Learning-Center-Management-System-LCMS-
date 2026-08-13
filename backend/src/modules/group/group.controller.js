const asyncHandler = require("../../middlewares/asyncHandler");
const groupService = require("./group.service");
const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model");
const ApiError = require("../../utils/ApiErrors");

const getTeacherProfileId = async (user) => {
  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    return teacher._id;
  }

  if (user.role === "secretary") {
    const secretary = await Secretary.findOne({ $or: [{ userId: user._id || user.id }, { user: user._id || user.id }] });
    if (secretary && secretary.teacher) {
      return secretary.teacher; 
    }

    if (user.createdBy) {
      const teacherByProfileId = await Teacher.findById(user.createdBy);
      if (teacherByProfileId) return teacherByProfileId._id;

      const teacherByUserId = await Teacher.findOne({ userId: user.createdBy });
      if (teacherByUserId) return teacherByUserId._id;
    }

    throw new ApiError("Linked teacher profile not found for this secretary", 404);
  }

  return null;
};

exports.createGroup = asyncHandler(async (req, res) => {
  let teacherId = null;

  if (req.user.role === "admin") {
    teacherId = req.body.teacherId;
    if (!teacherId) throw new ApiError("Teacher ID is required for admin", 400);
  } else {
    teacherId = await getTeacherProfileId(req.user);
  }

  const groupData = { ...req.body, teacherId };
  const group = await groupService.createGroup(groupData);

  res.status(201).json({
    success: true,
    message: "Group created successfully",
    data: group,
  });
});

exports.getAllGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getAllGroups(req.user);

  res.status(200).json({
    success: true,
    results: groups.length,
    data: groups,
  });
});

exports.getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.id, req.user);

  res.status(200).json({
    success: true,
    data: group,
  });
});

exports.updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroup(req.params.id, req.body, req.user);

  res.status(200).json({
    success: true,
    message: "Group updated successfully",
    data: group,
  });
});

exports.deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Group deleted successfully",
  });
});

exports.addStudentToGroup = asyncHandler(async (req, res) => {
  const { groupId, studentCode } = req.params;
  const student = await groupService.addStudentToGroup(groupId, studentCode, req.user);

  res.status(200).json({
    success: true,
    message: "Student added to group successfully",
    data: student,
  });
});

exports.removeStudentFromGroup = asyncHandler(async (req, res) => {
  const { groupId, studentCode } = req.params;
  const student = await groupService.removeStudentFromGroup(groupId, studentCode, req.user);

  res.status(200).json({
    success: true,
    message: "Student removed from group successfully",
    data: student,
  });
});

exports.getGroupStudents = asyncHandler(async (req, res) => {
  const students = await groupService.getGroupStudents(req.params.id, req.user);

  res.status(200).json({
    success: true,
    results: students.length,
    data: { students },
  });
});
