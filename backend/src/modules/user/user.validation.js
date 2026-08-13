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

exports.updateLoggedUserPasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

exports.updateLoggedUserDataValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be 3-100 chars"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number format"),
  handleValidationErrors,
];

exports.userIdParamValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid User ID format"),
  handleValidationErrors,
];

exports.assignRoleValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid User ID format"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "teacher", "student", "parent", "secretary"])
    .withMessage("Invalid role specified"),
  handleValidationErrors,
];