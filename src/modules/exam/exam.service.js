const Exam = require("./exam.model");

// .lean() skips Mongoose document overhead for read-only queries — faster, less memory
exports.createExam = (data) => Exam.create(data);

exports.getAllExams = () => Exam.find().sort("-createdAt").lean();

exports.getExamById = (id) => Exam.findById(id).lean();

exports.updateExam = (id, data) =>
  Exam.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

exports.deleteExam = (id) => Exam.findByIdAndDelete(id).lean();