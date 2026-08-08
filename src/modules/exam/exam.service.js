const Exam = require("./exam.model");

exports.createExam = (data) => Exam.create(data);

exports.getAllExams = () => Exam.find().sort("-createdAt").lean();

exports.getExamById = (id) => Exam.findById(id).lean();

exports.updateExam = (id, data) =>
  Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

exports.deleteExam = (id) => Exam.findByIdAndDelete(id).lean();

exports.publishExam = (id) =>
  Exam.findByIdAndUpdate(id, { status: "published" }, { new: true }).lean();