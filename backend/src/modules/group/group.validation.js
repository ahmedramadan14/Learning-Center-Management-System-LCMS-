const { check, param, validationResult } = require("express-validator");
const ApiError = require("../../utils/ApiErrors");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(", ");
    return next(new ApiError(errorMsg, 400));
  }
  next();
};

exports.createGroupValidator = [
  check("groupName")
    .notEmpty()
    .withMessage("Group name is required")
    .trim(),
  check("gradeLevelId")
    .notEmpty()
    .withMessage("Grade is required")
    .isMongoId()
    .withMessage("Invalid Grade ID format"),
  check("maxCapacity")
    .optional()
    .isNumeric()
    .withMessage("Max capacity must be a number")
    .isInt({ min: 1 })
    .withMessage("Max capacity must be at least 1"),
  check("sessionPrice")
    .notEmpty()
    .withMessage("Session price is required")
    .isNumeric()
    .withMessage("Session price must be a number"),
  check("sessionsPerCycle")
    .optional()
    .isNumeric()
    .withMessage("Sessions per cycle must be a number"),
  handleValidationErrors,
];

exports.updateGroupValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Group ID format"),
  check("groupName")
    .optional()
    .notEmpty()
    .withMessage("Group name cannot be empty")
    .trim(),
  check("gradeLevelId")
    .optional()
    .isMongoId()
    .withMessage("Invalid Grade ID format"),
  check("maxCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max capacity must be at least 1"),
  check("sessionPrice")
    .optional()
    .isNumeric()
    .withMessage("Session price must be a number"),
  handleValidationErrors,
];

exports.getGroupValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Group ID format"),
  handleValidationErrors,
];

exports.deleteGroupValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Group ID format"),
  handleValidationErrors,
];

exports.validateGetGroupStudents = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Group ID format"),
  handleValidationErrors,
];

exports.validateStudentGroupAction = [
  param("groupId")
    .isMongoId()
    .withMessage("Invalid Group ID format"),
  param("studentCode")
    .notEmpty()
    .withMessage("Student code is required"),
  handleValidationErrors,
];