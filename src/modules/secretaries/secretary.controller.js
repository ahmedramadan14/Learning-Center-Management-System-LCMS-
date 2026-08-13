const asyncHandler = require("../../middlewares/asyncHandler");
const secretaryService = require("./secretary.service");
const Teacher = require("../teacher/teacher.model");
const ApiError = require("../../utils/ApiErrors");

exports.createSecretary = asyncHandler(async (req, res) => {
  let teacherId = req.body.teacherId || req.body.teacher;

  if (req.user.role === "teacher") {
    const teacherProfile = await Teacher.findOne({ userId: req.user.id || req.user._id });
    if (!teacherProfile) {
      throw new ApiError("Teacher profile not found for this user", 404);
    }

    if (teacherId && teacherId.toString() !== teacherProfile._id.toString()) {
      throw new ApiError("Teachers can only create secretaries for their own profile", 403);
    }

    teacherId = teacherProfile._id;
  }

  if (!teacherId) {
    throw new ApiError("Teacher ID is required to create a secretary", 400);
  }

  const secretary = await secretaryService.createSecretary({
    ...req.body,
    teacherId,
  });

  res.status(201).json({
    success: true,
    message: "Secretary created successfully",
    data: secretary,
  });
});

exports.getAllSecretaries = asyncHandler(async (req, res) => {
  const secretaries = await secretaryService.getAllSecretaries(req.user);
  res.status(200).json({
    success: true,
    results: secretaries.length,
    data: secretaries,
  });
});

exports.getOneSecretary = asyncHandler(async (req, res) => {
  const secretary = await secretaryService.getOneSecretary(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: secretary,
  });
});

exports.updateOneSecretary = asyncHandler(async (req, res) => {
  const secretary = await secretaryService.updateOneSecretary(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: "Secretary updated successfully",
    data: secretary,
  });
});

exports.deleteOneSecretary = asyncHandler(async (req, res) => {
  await secretaryService.deleteOneSecretary(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Secretary deleted successfully",
  });
});
