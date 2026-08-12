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

exports.createStudentValidation = [
  body("name")
    .notEmpty()
    .withMessage("Student name is required")
    .trim(),
  body("phone")
    .notEmpty()
    .withMessage("Student phone is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("parentPhone")
    .notEmpty()
    .withMessage("Parent phone is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian parent phone number format"),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female"),
  body("grade")
    .notEmpty()
    .withMessage("Grade is required"),
  handleValidationErrors,
];

exports.getStudentByCodeValidation = [
  body("studentCode")
    .notEmpty()
    .withMessage("Student code is required")
    .trim(),
  handleValidationErrors,
];

exports.studentCodeParamValidation = [
  param("studentCode")
    .notEmpty()
    .withMessage("Student code is required")
    .trim(),
  handleValidationErrors,
];

exports.studentIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid student ID"),
  handleValidationErrors,
];