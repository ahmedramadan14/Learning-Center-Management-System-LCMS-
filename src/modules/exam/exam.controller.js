const examService = require("./exam.service");

exports.createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body, req.user);
    res.status(201).json({ data: exam });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "An exam with this data already exists" });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.getAllExams = async (req, res, next) => {
  try {
    const exams = await examService.getAllExams(req.user);
    res.status(200).json({ results: exams.length, data: exams });
  } catch (err) {
    next(err);
  }
};

exports.getExam = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id, req.user);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ data: exam });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
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
      return res.status(409).json({ message: "An exam with this data already exists" });
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
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.publishExam = async (req, res, next) => {
  try {
    const exam = await examService.publishExam(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ data: exam });
  } catch (err) {
    next(err);
  }
};