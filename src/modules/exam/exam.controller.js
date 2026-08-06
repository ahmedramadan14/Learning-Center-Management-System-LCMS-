const examService = require("./exam.service");

exports.createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json({ data: exam });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "An exam with this data already exists" });
    }
    next(err);
  }
};

exports.getAllExams = async (req, res) => {
  const exams = await examService.getAllExams();
  res.status(200).json({ results: exams.length, data: exams });
};

exports.getExam = async (req, res) => {
  const exam = await examService.getExamById(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.status(200).json({ data: exam });
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

exports.deleteExam = async (req, res) => {
  const exam = await examService.deleteExam(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.status(204).send();
};

exports.publishExam = async (req, res) => {
  const exam = await examService.publishExam(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.status(200).json({ data: exam });
};