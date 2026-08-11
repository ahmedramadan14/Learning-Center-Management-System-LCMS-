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

exports.createScheduleValidator = [
  check("groupId")
    .notEmpty()
    .withMessage("Group is required")
    .isMongoId()
    .withMessage("Invalid Group ID"),

  check("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["weekly", "extra"])
    .withMessage("Type must be weekly or extra"),

  check("dayOfWeek")
    .if((value, { req }) => req.body.type === "weekly")
    .notEmpty()
    .withMessage("Day of week is required for weekly schedules")
    .isInt({ min: 0, max: 6 })
    .withMessage("Day must be an integer between 0 and 6"),

  check("specificDate")
    .if((value, { req }) => req.body.type === "extra")
    .notEmpty()
    .withMessage("specificDate is required for extra schedules")
    .isISO8601()
    .toDate()
    .withMessage("specificDate must be a valid date"),

  check("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format (e.g. 14:30)"),

  check("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm format (e.g. 16:30)")
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  handleValidationErrors,
];

exports.getScheduleValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Schedule ID"),
  handleValidationErrors,
];

exports.updateScheduleValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Schedule ID"),

  check("groupId")
    .optional()
    .isMongoId()
    .withMessage("Invalid Group ID"),

  check("type")
    .optional()
    .isIn(["weekly", "extra"])
    .withMessage("Type must be weekly or extra"),

  check("dayOfWeek")
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage("Day must be an integer between 0 and 6"),

  check("specificDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("specificDate must be a valid date"),

  check("startTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format"),

  check("endTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm format")
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  handleValidationErrors,
];

exports.deleteScheduleValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid Schedule ID"),
  handleValidationErrors,
];