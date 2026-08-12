const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/ApiErrors');
const examService = require("./exam.service");

exports.createExam = asyncHandler(async (req, res, next) => {
    const exam = await examService.createExam(req.body, req.user);
    res.status(201).json({ success: true, message: "Exam Created Successfully", data: exam });
});

exports.getAllExams = asyncHandler(async (req, res, next) => {
    const exams = await examService.getAllExams(req.user);
    res.status(200).json({ success: true, results: exams.length, data: exams });
});

exports.getExam = asyncHandler(async (req, res, next) => {
    const exam = await examService.getExamById(req.params.id, req.user);
    if (!exam) return next(new ApiError("Exam not found", 404));
    res.status(200).json({ success: true, data: exam });
});

exports.updateExam = asyncHandler(async (req, res, next) => {
    const exam = await examService.updateExam(req.params.id, req.body, req.user);
    if (!exam) return next(new ApiError("Exam not found", 404));
    res.status(200).json({ success: true, message: "Exam Updated Successfully", data: exam });
});

exports.deleteExam = asyncHandler(async (req, res, next) => {
    const exam = await examService.deleteExam(req.params.id, req.user);
    if (!exam) return next(new ApiError("Exam not found", 404));
    res.status(200).json({ success: true, message: "Exam Deleted Successfully" });
});

exports.publishExam = asyncHandler(async (req, res, next) => {
    const exam = await examService.publishExam(req.params.id, req.user);
    if (!exam) return next(new ApiError("Exam not found", 404));
    res.status(200).json({ success: true, message: "Exam Published Successfully", data: exam });
});