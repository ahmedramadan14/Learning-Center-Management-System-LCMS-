const { check, param, query, validationResult } = require('express-validator');
const ApiError = require('../../utils/ApiErrors');
const { PAYMENT_STATUSES } = require('./payment.model');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    return next(new ApiError(errorMsg, 400));
  }
  next();
};

const validatePaymentId = [
  param('id')
    .isMongoId()
    .withMessage('Payment id must be a valid id.'),
  handleValidationErrors,
];

const validateCreatePayment = [
  check('studentId')
    .notEmpty()
    .withMessage('studentId is required.')
    .isMongoId()
    .withMessage('studentId must be a valid id.'),

  check('groupId')
    .notEmpty()
    .withMessage('groupId is required.')
    .isMongoId()
    .withMessage('groupId must be a valid id.'),

  check('sessionDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('sessionDate must be a valid date.'),

  check('sessionNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('sessionNumber must be a positive integer.'),

  check('amountDue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amountDue must be a non-negative number.'),

  check('amountPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amountPaid must be a non-negative number.'),

  handleValidationErrors,
];

const validateCreateByCode = [
  check('studentCode')
    .notEmpty()
    .withMessage('studentCode is required.')
    .trim(),

  check('groupId')
    .notEmpty()
    .withMessage('groupId is required.')
    .isMongoId()
    .withMessage('groupId must be a valid id.'),

  check('sessionDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('sessionDate must be a valid date.'),

  check('sessionNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('sessionNumber must be a positive integer.'),

  check('amountDue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amountDue must be a non-negative number.'),

  check('amountPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amountPaid must be a non-negative number.'),

  handleValidationErrors,
];

const validateUpdatePayment = [
  param('id')
    .isMongoId()
    .withMessage('Payment id must be a valid id.'),

  check('sessionDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('sessionDate must be a valid date.'),

  check('sessionNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('sessionNumber must be a positive integer.'),

  check('amountDue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('amountDue must be a non-negative number.'),

  handleValidationErrors,
];

const validateRecordPayment = [
  param('id')
    .isMongoId()
    .withMessage('Payment id must be a valid id.'),

  check('amount')
    .notEmpty()
    .withMessage('amount is required.')
    .isFloat({ gt: 0 })
    .withMessage('amount must be greater than zero.'),

  handleValidationErrors,
];

const validatePaymentList = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100.'),

  query('studentId')
    .optional()
    .isMongoId()
    .withMessage('studentId must be a valid id.'),

  query('groupId')
    .optional()
    .isMongoId()
    .withMessage('groupId must be a valid id.'),

  query('status')
    .optional()
    .isIn(PAYMENT_STATUSES)
    .withMessage('status must be unpaid, partial, or paid.'),

  query('sessionDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('sessionDate must be a valid date.'),

  handleValidationErrors,
];

module.exports = {
  validatePaymentId,
  validateCreatePayment,
  validateCreateByCode,
  validateUpdatePayment,
  validateRecordPayment,
  validatePaymentList,
};