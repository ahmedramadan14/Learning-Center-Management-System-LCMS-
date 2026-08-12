const { body, param, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiErrors");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(", ");
    return next(new ApiError(errorMsg, 400));
  }
  next();
};

exports.createResultRules = [
  body("exam")
    .notEmpty()
    .withMessage("exam is required")
    .isMongoId()
    .withMessage("exam must be a valid ID"),
  body("studentCode")
    .notEmpty()
    .withMessage("studentCode is required")
    .trim(),
  body("marks")
    .notEmpty()
    .withMessage("marks is required")
    .isFloat({ min: 0 })
    .withMessage("marks must be a non-negative number"),
  handleValidationErrors,
];

exports.updateResultRules = [
  param("id")
    .isMongoId()
    .withMessage("Invalid result ID"),
  body("exam")
    .optional()
    .isMongoId()
    .withMessage("exam must be a valid ID"),
  body("marks")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("marks must be a non-negative number"),
  handleValidationErrors,
];

exports.idParamRule = [
  param("id")
    .isMongoId()
    .withMessage("Invalid result ID"),
  handleValidationErrors,
];

exports.examIdParamRule = [
  param("examId")
    .isMongoId()
    .withMessage("Invalid exam ID"),
  handleValidationErrors,
];

exports.studentCodeParamRule = [
  param("studentCode")
    .trim()
    .notEmpty()
    .withMessage("studentCode is required"),
  handleValidationErrors,
];