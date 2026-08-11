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

exports.createParentStudentValidation = [
  body("parent")
    .notEmpty()
    .withMessage("Parent ID is required")
    .isMongoId()
    .withMessage("Invalid Parent ID format"),
  body("student")
    .notEmpty()
    .withMessage("Student ID is required")
    .isMongoId()
    .withMessage("Invalid Student ID format"),
  handleValidationErrors,
];

exports.linkChildValidation = [
  body("studentCode")
    .notEmpty()
    .withMessage("Student code is required")
    .trim(),
  handleValidationErrors,
];

exports.idParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID format"),
  handleValidationErrors,
];

exports.parentParamValidation = [
  param("parentId")
    .isMongoId()
    .withMessage("Invalid Parent ID format"),
  handleValidationErrors,
];

exports.studentParamValidation = [
  param("studentId")
    .isMongoId()
    .withMessage("Invalid Student ID format"),
  handleValidationErrors,
];