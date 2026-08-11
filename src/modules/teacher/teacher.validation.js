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

exports.createTeacherValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim(),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
    .trim(),
  body("subject")
    .optional()
    .isString()
    .withMessage("Subject must be a string")
    .trim(),
  handleValidationErrors,
];

exports.updateTeacherValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
    .trim(),
  body("subject")
    .optional()
    .isString()
    .withMessage("Subject must be a string")
    .trim(),
  handleValidationErrors,
];

exports.teacherIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid teacher ID format"),
  handleValidationErrors,
];