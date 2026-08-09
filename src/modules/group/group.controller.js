const asyncHandler = require("../../middlewares/asyncHandler");
const groupService = require("./group.service");

// Create Group
exports.createGroup = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.body);

  res.status(201).json({
    success: true,
    message: "Group created successfully",
    data: group,
  });
});

// Get All Groups
exports.getAllGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getAllGroups();

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

// Add Student To Group
exports.addStudentToGroup = asyncHandler(async (req, res) => {
  const { groupId, studentCode } = req.params;

  const student = await groupService.addStudentToGroup(
    groupId,
    studentCode
  );

  res.status(200).json({
    success: true,
    message: "Student added to group successfully",
    data: student,
  });
});

// Remove Student From Group
exports.removeStudentFromGroup = asyncHandler(async (req, res) => {
  const { groupId, studentCode } = req.params;

  const student = await groupService.removeStudentFromGroup(
    groupId,
    studentCode
  );

  res.status(200).json({
    success: true,
    message: "Student removed from group successfully",
    data: student,
  });
});

// Get Group Students
exports.getGroupStudents = asyncHandler(async (req, res) => {
  const students = await groupService.getGroupStudents(req.params.groupId);

  res.status(200).json({
    success: true,
    results: students.length,
    data: students,
  });
});