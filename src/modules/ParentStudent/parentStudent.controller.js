const asyncHandler = require("../../middlewares/asyncHandler");
const parentStudentService = require("./parentStudent.service");

exports.createParentStudent = asyncHandler(async (req, res) => {
  const newParentStudent = await parentStudentService.createParentStudent(req.body, req.user);
  res.status(201).json({
    success: true,
    message: "Parent linked to student successfully",
    data: newParentStudent,
  });
});

exports.getAllParentStudents = asyncHandler(async (req, res) => {
  const parentStudents = await parentStudentService.getAllParentStudents(req.user);
  res.status(200).json({
    success: true,
    results: parentStudents.length,
    data: parentStudents,
  });
});

exports.getOneParentStudent = asyncHandler(async (req, res) => {
  const parentStudent = await parentStudentService.getOneParentStudent(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: parentStudent,
  });
});

exports.getParentStudents = asyncHandler(async (req, res) => {
  const students = await parentStudentService.getParentStudents(req.params.parentId, req.user);
  res.status(200).json({
    success: true,
    results: students.length,
    data: students,
  });
});

exports.getStudentParents = asyncHandler(async (req, res) => {
  const parents = await parentStudentService.getStudentParents(req.params.studentId, req.user);
  res.status(200).json({
    success: true,
    results: parents.length,
    data: parents,
  });
});

exports.deleteParentStudent = asyncHandler(async (req, res) => {
  await parentStudentService.deleteParentStudent(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Student unlinked from parent successfully",
  });
});

exports.linkChildByCode = asyncHandler(async (req, res) => {
  const parentStudent = await parentStudentService.linkChildByCode(req.user, req.body.studentCode);
  res.status(201).json({
    success: true,
    message: "Child linked successfully",
    data: parentStudent,
  });
});

exports.getMyChildren = asyncHandler(async (req, res) => {
  const students = await parentStudentService.getMyChildren(req.user);
  res.status(200).json({
    success: true,
    results: students.length,
    data: students,
  });
});
