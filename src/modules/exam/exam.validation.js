const { body, param, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiErrors");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join(", ");
    return next(new ApiError(errorMsg, 400));
  }
  next();
};

exports.createExamRules = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").optional().trim(),
  body("group").isMongoId().withMessage("group must be a valid ID"),
  body("totalMarks").isFloat({ min: 1 }).withMessage("totalMarks must be at least 1"),
  body("passingMarks")
    .isFloat({ min: 0 }).withMessage("passingMarks must be a non-negative number")
    .custom((value, { req }) => {
      if (req.body.totalMarks && Number(value) > Number(req.body.totalMarks)) {
        throw new Error("passingMarks cannot be greater than totalMarks");
      }
      return true;
    }),
  body("examDate")
    .notEmpty().withMessage("Exam date is required")
    .isISO8601().toDate().withMessage("Exam date must be a valid date"),
  body("duration").isInt({ min: 1 }).withMessage("duration must be at least 1 minute"),
  body("status").optional().isIn(["draft", "published", "closed"]).withMessage("status must be draft, published, or closed"),
  handleValidationErrors
];

exports.updateExamRules = [
  param("id").isMongoId().withMessage("Invalid exam ID"),
  body("title").optional().trim().notEmpty().withMessage("title cannot be empty"),
  body("description").optional().trim(),
  body("group").optional().isMongoId().withMessage("group must be a valid ID"),
  body("totalMarks").optional().isFloat({ min: 1 }).withMessage("totalMarks must be at least 1"),
  body("passingMarks")
    .optional()
    .isFloat({ min: 0 }).withMessage("passingMarks must be a non-negative number")
    .custom((value, { req }) => {
      if (req.body.totalMarks && Number(value) > Number(req.body.totalMarks)) {
        throw new Error("passingMarks cannot be greater than totalMarks");
      }
      return true;
    }),
  body("examDate").optional().isISO8601().toDate().withMessage("examDate must be a valid date"),
  body("duration").optional().isInt({ min: 1 }).withMessage("duration must be at least 1 minute"),
  body("status").optional().isIn(["draft", "published", "closed"]).withMessage("status must be draft, published, or closed"),
  handleValidationErrors
];

exports.idParamRule = [
  param("id").isMongoId().withMessage("Invalid exam ID"),
  handleValidationErrors
];
