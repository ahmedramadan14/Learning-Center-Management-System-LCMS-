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

exports.createParentValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("gender")
    .optional()
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female"),
  handleValidationErrors,
];

exports.getOneParentValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid parent ID format"),
  handleValidationErrors,
];

exports.deleteOneParentValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid parent ID format"),
  handleValidationErrors,
];

exports.updateParentValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid parent ID format"),
  body("gender")
    .optional()
    .isIn(["male", "female"])
    .withMessage("Gender must be male or female"),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("phone").optional().trim().notEmpty().withMessage("Phone cannot be empty"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email address").normalizeEmail(),
  body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
  handleValidationErrors,
];
