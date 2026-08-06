const { check } = require("express-validator");

exports.createGroupValidator = [
  check("groupName")
    .notEmpty()
    .withMessage("Group name is required"),

  check("gradeLevelId")
    .notEmpty()
    .withMessage("Grade is required")
    .isMongoId()
    .withMessage("Invalid Grade ID"),

  check("teacherId")
    .notEmpty()
    .withMessage("Teacher is required")
    .isMongoId()
    .withMessage("Invalid Teacher ID"),

  check("maxCapacity")
    .notEmpty()
    .withMessage("Max capacity is required")
    .isNumeric()
    .withMessage("Max capacity must be a number"),

  check("monthlyFee")
    .notEmpty()
    .withMessage("Monthly fee is required")
    .isNumeric()
    .withMessage("Monthly fee must be a number"),

  check("sessionsPerCycle")
    .notEmpty()
    .withMessage("Sessions per cycle is required")
    .isNumeric()
    .withMessage("Sessions per cycle must be a number"),
];

exports.updateGroupValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Group ID"),
];

exports.getGroupValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Group ID"),
];

exports.deleteGroupValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Group ID"),
];