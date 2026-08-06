const { body, param } = require("express-validator");

exports.createResultRules = [
  body("examId")
    .isMongoId().withMessage("examId must be a valid ID"),
  body("studentId")
    .isMongoId().withMessage("studentId must be a valid ID"),
  body("score")
    .isFloat({ min: 0, max: 100 }).withMessage("score must be a number between 0 and 100"),
];

exports.updateResultRules = [
  body("examId")
    .optional()
    .isMongoId().withMessage("examId must be a valid ID"),
  body("studentId")
    .optional()
    .isMongoId().withMessage("studentId must be a valid ID"),
  body("score")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("score must be a number between 0 and 100"),
];

exports.idParamRule = [
  param("id").isMongoId().withMessage("Invalid result ID"),
];