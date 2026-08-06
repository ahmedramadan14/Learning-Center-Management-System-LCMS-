const resultService = require("./result.service");

exports.createResult = async (req, res, next) => {
  try {
    const result = await resultService.createResult(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This student already has a result for this exam" });
    }
    next(err);
  }
};

exports.getAllResults = async (req, res, next) => {
  try {
    const results = await resultService.getAllResults();
    res.status(200).json({ results: results.length, data: results });
  } catch (err) {
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
    if (err.code === 11000) {
      return res.status(409).json({ message: "This student already has a result for this exam" });
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