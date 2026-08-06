const { body, param } = require("express-validator");

exports.createGradeValidator = [
  body("name")
    .notEmpty()
    .withMessage("Grade name is required"),
];

exports.updateGradeValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid grade id"),

  body("name")
    .optional()
    .notEmpty()
    .withMessage("Grade name is required"),
];

exports.getGradeValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid grade id"),
];

exports.deleteGradeValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid grade id"),
];