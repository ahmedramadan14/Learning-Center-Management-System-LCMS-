const { body, param } = require("express-validator");

exports.createExamRules = [
  body("paperExamId")
    .isMongoId().withMessage("paperExamId must be a valid ID"),
  body("studentId")
    .isMongoId().withMessage("studentId must be a valid ID"),
  body("score")
    .isFloat({ min: 0, max: 100 }).withMessage("score must be a number between 0 and 100"),
];

exports.updateExamRules = [
  body("paperExamId")
    .optional()
    .isMongoId().withMessage("paperExamId must be a valid ID"),
  body("studentId")
    .optional()
    .isMongoId().withMessage("studentId must be a valid ID"),
  body("score")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("score must be a number between 0 and 100"),
];

exports.idParamRule = [
  param("id").isMongoId().withMessage("Invalid exam ID"),
];