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

exports.createSecretaryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number format"),
  body("department")
    .optional()
    .isString()
    .withMessage("department must be a string"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("permissions must be an array"),
  handleValidationErrors,
];

exports.getOneSecretaryValidation = [
  param("id").isMongoId().withMessage("Invalid secretary id"),
  handleValidationErrors,
];

exports.deleteOneSecretaryValidation = [
  param("id").isMongoId().withMessage("Invalid secretary id"),
  handleValidationErrors,
];

exports.updateSecretaryValidation = [
  param("id").isMongoId().withMessage("Invalid secretary id"),
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number format"),
  body("department")
    .optional()
    .isString()
    .withMessage("department must be a string"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("permissions must be an array"),
  handleValidationErrors,
];