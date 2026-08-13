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

exports.createGradeValidator = [
  body("name")
    .notEmpty()
    .withMessage("Grade name is required")
    .isString()
    .trim(),
  handleValidationErrors,
];

exports.updateGradeValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid grade ID format"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Grade name cannot be empty")
    .isString()
    .trim(),
  handleValidationErrors,
];

exports.getGradeValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid grade ID format"),
  handleValidationErrors,
];

exports.deleteGradeValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid grade ID format"),
  handleValidationErrors,
];