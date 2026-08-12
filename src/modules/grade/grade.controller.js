const asyncHandler = require("../../middlewares/asyncHandler");
const gradeService = require("./grade.service");

exports.createGrade = asyncHandler(async (req, res) => {
  const grade = await gradeService.createGrade(req.body);
  res.status(201).json({
    success: true,
    message: "Grade created successfully",
    data: grade,
  });
});

exports.getAllGrades = asyncHandler(async (req, res) => {
  const grades = await gradeService.getAllGrades(req.user);
  res.status(200).json({
    success: true,
    results: grades.length,
    data: grades,
  });
});

exports.getGradeById = asyncHandler(async (req, res) => {
  const grade = await gradeService.getGradeById(req.params.id);
  res.status(200).json({
    success: true,
    data: grade,
  });
});

exports.updateGrade = asyncHandler(async (req, res) => {
  const grade = await gradeService.updateGrade(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Grade updated successfully",
    data: grade,
  });
});

exports.deleteGrade = asyncHandler(async (req, res) => {
  await gradeService.deleteGrade(req.params.id);
  res.status(200).json({
    success: true,
    message: "Grade deleted successfully",
  });
});