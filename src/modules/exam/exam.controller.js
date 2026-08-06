const examService = require("./exam.service");

exports.createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json({ data: exam });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This student already has a record for this exam" });
    }
    next(err);
  }
};

exports.getAllExams = async (req, res, next) => {
  try {
    const exams = await examService.getAllExams();
    res.status(200).json({ results: exams.length, data: exams });
  } catch (err) {
    next(err);
  }
};

exports.getExam = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ data: exam });
  } catch (err) {
    next(err);
  }
};

exports.updateExam = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ data: exam });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This student already has a record for this exam" });
    }
    next(err);
  }
};

exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await examService.deleteExam(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};