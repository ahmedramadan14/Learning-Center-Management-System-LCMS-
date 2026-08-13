const { check, validationResult } = require('express-validator');
const ApiError = require('../../utils/ApiErrors');

// Middleware to handle validation errors[cite: 16]
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join(', ');
        return next(new ApiError(errorMsg, 400));
    }
    next();
};

const ValidationSignup = [
    check('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),

    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone('ar-EG').withMessage('Invalid Egyptian phone number format'),

    check('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),

    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    check('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['student', 'teacher', 'parent']).withMessage('Invalid role value. Must be student, teacher, or parent.'),

    check('gender')
        .if((value, { req }) => req.body.role === 'student')
        .notEmpty().withMessage('Gender is required for students')
        .isIn(['male', 'female']).withMessage('Gender must be male or female'),

    check('grade')
        .if((value, { req }) => req.body.role === 'student')
        .notEmpty().withMessage('Grade is required for students'),

    check('parentPhone')
        .if((value, { req }) => req.body.role === 'student')
        .notEmpty().withMessage('Parent phone is required for students')
        .isMobilePhone('ar-EG').withMessage('Invalid Egyptian phone number format for parent'),

    handleValidationErrors
];

const ValidationLogin = [
    check('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone('ar-EG').withMessage('Invalid Egyptian phone number format'),

    check('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

module.exports = {
    ValidationSignup,
    ValidationLogin
};
