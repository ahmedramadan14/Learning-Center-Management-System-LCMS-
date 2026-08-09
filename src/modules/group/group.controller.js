const asyncHandler = require("../../middlewares/asyncHandler");
const groupService = require("./group.service");
const User = require("../user/user.model");
const Teacher = require("../teacher/teacher.model");
const ApiError = require("../../utils/ApiErrors");

// Create Group
exports.createGroup = asyncHandler(async (req, res) => {
  let teacherId = null;

  if (req.user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: req.user._id || req.user.id });
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    teacherId = teacher._id;
  } 
  else if (req.user.role === "secretary") {
    if (!req.user.createdBy) {
      throw new ApiError("Secretary is not linked to any teacher", 400);
    }
    const teacher = await Teacher.findOne({ userId: req.user.createdBy });
    if (!teacher) throw new ApiError("Linked teacher profile not found", 404);
    teacherId = teacher._id;
  } else if (req.user.role === "admin") {
    teacherId = req.body.teacherId;
    if (!teacherId) throw new ApiError("Teacher ID is required for admin", 400);
  }

  const groupData = {
    ...req.body,
    teacherId,
  };

  const group = await groupService.createGroup(groupData);

  res.status(201).json({
    success: true,
    message: "Group created successfully",
    data: group,
  });
});

// Get All Groups
exports.getAllGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getAllGroups(req.user);

  res.status(200).json({
    success: true,
    results: groups.length,
    data: groups,
  });
});

// Get Group By Id
exports.getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.id);

  res.status(200).json({
    success: true,
    data: group,
  });
});

// Update Group
exports.updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroup(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Group updated successfully",
    data: group,
  });
});

// Delete Group
exports.deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.params.id);

  res.status(200).json({
    success: true,
    message: "Group deleted successfully",
  });
});