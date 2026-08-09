const { body, param } = require("express-validator")

// Create Parent Validation

const createParentValidation = [
    body("userId")
        .notEmpty()
        .withMessage("userId is required")
        .isMongoId()
        .withMessage("Invalid userId")
]

// Get One Parent Validation

const getOneParentValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid parent id")
]

// Delete Parent Validation

const deleteOneParentValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid parent id")
]

// Update Parent Validation

const updateParentValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid parent id"),

    body("userId")
        .optional()
        .isMongoId()
        .withMessage("Invalid userId")
]

module.exports = {
    createParentValidation,
    getOneParentValidation,
    deleteOneParentValidation,
    updateParentValidation
}