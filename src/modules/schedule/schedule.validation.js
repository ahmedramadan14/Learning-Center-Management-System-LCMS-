const { check } = require("express-validator");

exports.createScheduleValidator = [
  check("groupId")
    .notEmpty()
    .withMessage("Group is required")
    .isMongoId()
    .withMessage("Invalid Group ID"),

  check("dayOfWeek")
    .notEmpty()
    .withMessage("Day of week is required")
    .isNumeric()
    .withMessage("Day must be a number"),

  check("startTime")
    .notEmpty()
    .withMessage("Start time is required"),

  check("endTime")
    .notEmpty()
    .withMessage("End time is required"),

  check("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["weekly", "extra"])
    .withMessage("Type must be weekly or extra"),
];

exports.getScheduleValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Schedule ID"),
];

exports.updateScheduleValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Schedule ID"),
];

exports.deleteScheduleValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Schedule ID"),
];