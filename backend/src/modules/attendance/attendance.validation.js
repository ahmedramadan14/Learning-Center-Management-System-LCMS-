const { check, param, validationResult } = require('express-validator');
const ApiError = require('../../utils/ApiErrors');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(err => err.msg).join(', ');
        return next(new ApiError(errorMsg, 400));
    }
    next();
};

const ValidationCAttend = [
    check('studentCode')
        .notEmpty().withMessage('Student code is required'),
        
    check('groupId')
        .notEmpty().withMessage('GroupId is required')
        .isMongoId().withMessage('Invalid groupId format'),
        
    check('status')
        .notEmpty().withMessage('Status is required')
        .isIn(["Present", "Absent", "Late", "Excused"]).withMessage('Invalid status value'),
        
    check('date')
        .optional()
        .isISO8601().toDate().withMessage('Invalid Date format'),
        
    check('method')
        .optional()
        .isIn(["Manual", "QR", "NFC", "Barcode"]).withMessage('Invalid method value'),
        
    handleValidationErrors
];

const ValidationUAttend = [
    param('id')
        .isMongoId().withMessage('Invalid Attendance ID'),
        
    check('status')
        .optional()
        .isIn(["Present", "Absent", "Late", "Excused"]).withMessage('Invalid status value'),
        
    check('date')
        .optional()
        .isISO8601().toDate().withMessage('Invalid Date format'),
        
    check('method')
        .optional()
        .isIn(["Manual", "QR", "NFC", "Barcode"]).withMessage('Invalid method value'),
        
    handleValidationErrors
];

const ValidationMongoId = [
    param('id')
        .isMongoId().withMessage('Invalid record ID'),
        
    handleValidationErrors
];

const ValidationStudentCode = [
    param('studentCode')
        .notEmpty().withMessage('Student code is required'),
        
    handleValidationErrors
];

module.exports = { 
    ValidationCAttend, 
    ValidationUAttend, 
    ValidationMongoId, 
    ValidationStudentCode 
};