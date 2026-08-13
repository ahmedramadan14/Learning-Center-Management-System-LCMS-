const teacherService = require("./teacher.service");
const asyncHandler = require("../../middlewares/asyncHandler");
const ApiError = require("../../utils/ApiErrors");

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await teacherService.createTeacher(req.body);
  res.status(201).json({
    success: true,
    message: "Teacher created successfully",
    data: teacher,
  });
});

const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await teacherService.getTeachers();
  res.status(200).json({
    success: true,
    data: {
      count: teachers.length,
      teachers,
    },
  });
});

const getTeacherById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const teacher = await teacherService.getTeacherById(id, req.user);
  if (!teacher) throw new ApiError("Teacher not found", 404);

  res.status(200).json({
    success: true,
    data: { teacher },
  });
});

const getMyTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherByUserId(req.user._id || req.user.id);
  if (!teacher) throw new ApiError("Teacher profile not found", 404);

  res.status(200).json({
    success: true,
    data: { teacher },
  });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updatedTeacher = await teacherService.updateTeacher(id, req.body, req.user);

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: updatedTeacher,
  });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deletedTeacher = await teacherService.deleteTeacher(id);
  if (!deletedTeacher) throw new ApiError("Teacher not found", 404);

  res.status(200).json({
    success: true,
    message: "Teacher deactivated successfully",
    data: deletedTeacher,
  });
});

const activateTeacher = asyncHandler(async (req, res) => {
  const activatedTeacher = await teacherService.activateTeacher(req.params.id);
  res.status(200).json({
    success: true,
    message: "Teacher activated successfully",
    data: activatedTeacher,
  });
});

const deactivateTeacher = asyncHandler(async (req, res) => {
  const deactivatedTeacher = await teacherService.deactivateTeacher(req.params.id);
  res.status(200).json({
    success: true,
    message: "Teacher deactivated successfully",
    data: deactivatedTeacher,
  });
});

const approveTeacher = asyncHandler(async (req, res) => {
  const approvedUser = await teacherService.approveTeacher(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Teacher approved successfully",
    data: approvedUser,
  });
});

const rejectTeacher = asyncHandler(async (req, res) => {
  const rejectedUser = await teacherService.rejectTeacher(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Teacher request rejected",
    data: rejectedUser,
  });
});

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  getMyTeacherProfile,
  updateTeacher,
  deleteTeacher,
  activateTeacher,
  deactivateTeacher,
  approveTeacher,
  rejectTeacher,
};
