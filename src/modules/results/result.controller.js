const resultService = require("./result.service");

exports.createResult = async (req, res, next) => {
  try {
    const result = await resultService.createResult(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This student already has a result for this exam" });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.getAllResults = async (req, res) => {
  const results = await resultService.getAllResults();
  res.status(200).json({ results: results.length, data: results });
};

exports.getResult = async (req, res) => {
  const result = await resultService.getResultById(req.params.id);
  if (!result) return res.status(404).json({ message: "Result not found" });
  res.status(200).json({ data: result });
};

exports.updateResult = async (req, res, next) => {
  try {
    const result = await resultService.updateResult(req.params.id, req.body);
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.status(200).json({ data: result });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This student already has a result for this exam" });
    }
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.deleteResult = async (req, res) => {
  const result = await resultService.deleteResult(req.params.id);
  if (!result) return res.status(404).json({ message: "Result not found" });
  res.status(204).send();
};

exports.getStudentResults = async (req, res, next) => {
  try {
    const results = await resultService.getResultsByStudentCode(req.params.studentCode);
    res.status(200).json({ results: results.length, data: results });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.examResults = async (req, res) => {
  const results = await resultService.getResultsByExam(req.params.examId);
  res.status(200).json({ results: results.length, data: results });
};