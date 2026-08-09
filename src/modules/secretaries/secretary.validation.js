const { body, param } = require("express-validator")

// Create Secretarie Validation

const createSecretarieValidation = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required")
        .bail()
        .isMongoId()
        .withMessage("Invalid userId"),

    body("department")
        .notEmpty()
        .withMessage("department is required")
        .bail()
        .isString()
        .withMessage("department must be a string"),

    body("permission")
        .optional()
        .isArray()
        .withMessage("permission must be an array")
]

// Get One Secretarie Validation

const getOneSecretarieValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid secretarie id")
]

// Delete One Secretarie Validation

const deleteOneSecretarieValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid secretarie id")
]

// Update Secretarie Validation

const updateSecretarieValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid secretarie id"),

    body("userId")
        .optional()
        .isMongoId()
        .withMessage("Invalid userId"),

    body("department")
        .optional()
        .isString()
        .withMessage("department must be a string"),

    body("permission")
        .optional()
        .isArray()
        .withMessage("permission must be an array")
]

module.exports = {
    createSecretarieValidation,
    getOneSecretarieValidation,
    deleteOneSecretarieValidation,
    updateSecretarieValidation
}