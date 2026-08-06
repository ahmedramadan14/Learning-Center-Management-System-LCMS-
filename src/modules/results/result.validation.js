const { body, param } = require("express-validator");

exports.createResultRules = [
  body("exam").isMongoId().withMessage("exam must be a valid ID"),
  body("student").isMongoId().withMessage("student must be a valid ID"),
  body("marks").isFloat({ min: 0 }).withMessage("marks must be a non-negative number"),
];

exports.updateResultRules = [
  body("exam").optional().isMongoId().withMessage("exam must be a valid ID"),
  body("student").optional().isMongoId().withMessage("student must be a valid ID"),
  body("marks").optional().isFloat({ min: 0 }).withMessage("marks must be a non-negative number"),
];

exports.idParamRule = [
  param("id").isMongoId().withMessage("Invalid result ID"),
];

exports.examIdParamRule = [
  param("examId").isMongoId().withMessage("Invalid exam ID"),
];

exports.studentCodeParamRule = [
  param("studentCode").trim().notEmpty().withMessage("studentCode is required"),
];