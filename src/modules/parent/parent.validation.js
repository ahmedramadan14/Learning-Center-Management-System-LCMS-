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
  body("user")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
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
  handleValidationErrors,
];