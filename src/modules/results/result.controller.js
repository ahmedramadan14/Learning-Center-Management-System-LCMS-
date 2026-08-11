const asyncHandler = require("../../middlewares/asyncHandler");
const resultService = require("./result.service");

exports.createResult = asyncHandler(async (req, res) => {
  const result = await resultService.createResult(req.body, req.user);
  res.status(201).json({
    success: true,
    message: "Result created successfully",
    data: result,
  });
});

exports.getAllResults = asyncHandler(async (req, res) => {
  const results = await resultService.getAllResults(req.user);
  res.status(200).json({
    success: true,
    results: results.length,
    data: results,
  });
});

exports.getStudentResults = asyncHandler(async (req, res) => {
  const results = await resultService.getResultsByStudentCode(req.params.studentCode, req.user);
  res.status(200).json({
    success: true,
    results: results.length,
    data: results,
  });
});

exports.getResult = asyncHandler(async (req, res) => {
  const result = await resultService.getResultById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.updateResult = asyncHandler(async (req, res) => {
  const result = await resultService.updateResult(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: "Result updated successfully",
    data: result,
  });
});

exports.deleteResult = asyncHandler(async (req, res) => {
  await resultService.deleteResult(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Result deleted successfully",
  });
});

exports.examResults = asyncHandler(async (req, res) => {
  const results = await resultService.getResultsByExam(req.params.examId, req.user);
  res.status(200).json({
    success: true,
    results: results.length,
    data: results,
  });
});