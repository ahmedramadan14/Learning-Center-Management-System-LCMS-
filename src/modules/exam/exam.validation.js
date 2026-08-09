const { body, param } = require("express-validator");

exports.createExamRules = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").optional().trim(),
  body("group").isMongoId().withMessage("group must be a valid ID"),
  body("teacher").isMongoId().withMessage("teacher must be a valid ID"),
  body("totalMarks").isFloat({ min: 1 }).withMessage("totalMarks must be at least 1"),
  body("passingMarks").isFloat({ min: 0 }).withMessage("passingMarks must be a non-negative number"),
  body("examDate").notEmpty().withMessage("Exam date is required").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Exam date must be in YYYY-MM-DD format"),
  body("duration").isInt({ min: 1 }).withMessage("duration must be at least 1 minute"),
  body("status").optional().isIn(["draft", "published", "closed"]).withMessage("status must be draft, published, or closed"),
];

exports.updateExamRules = [
  body("title").optional().trim().notEmpty().withMessage("title cannot be empty"),
  body("description").optional().trim(),
  body("group").optional().isMongoId().withMessage("group must be a valid ID"),
  body("teacher").optional().isMongoId().withMessage("teacher must be a valid ID"),
  body("totalMarks").optional().isFloat({ min: 1 }).withMessage("totalMarks must be at least 1"),
  body("passingMarks").optional().isFloat({ min: 0 }).withMessage("passingMarks must be a non-negative number"),
  body("examDate").optional().isISO8601().withMessage("examDate must be a valid date"),
  body("duration").optional().isInt({ min: 1 }).withMessage("duration must be at least 1 minute"),
  body("status").optional().isIn(["draft", "published", "closed"]).withMessage("status must be draft, published, or closed"),
];

exports.idParamRule = [
  param("id").isMongoId().withMessage("Invalid exam ID"),
];