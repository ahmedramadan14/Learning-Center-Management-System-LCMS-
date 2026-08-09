const resultService = require("./result.service");

exports.createResult = async (req, res, next) => {
  try {
    const result = await resultService.createResult(req.body, req.user);
    res.status(201).json({ data: result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.getAllResults = async (req, res, next) => {
  try {
    const results = await resultService.getAllResults(req.user);
    res.status(200).json({ results: results.length, data: results });
  } catch (err) {
    next(err);
  }
};

exports.getStudentResults = async (req, res, next) => {
  try {
    const results = await resultService.getResultsByStudentCode(req.params.studentCode, req.user);
    res.status(200).json({ results: results.length, data: results });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.getResult = async (req, res, next) => {
  try {
    const result = await resultService.getResultById(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

exports.updateResult = async (req, res, next) => {
  try {
    const result = await resultService.updateResult(req.params.id, req.body);
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.status(200).json({ data: result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

exports.deleteResult = async (req, res, next) => {
  try {
    const result = await resultService.deleteResult(req.params.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.examResults = async (req, res, next) => {
  try {
    const results = await resultService.getResultsByExam(req.params.examId);
    res.status(200).json({ results: results.length, data: results });
  } catch (err) {
    next(err);
  }
};