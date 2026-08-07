const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiErrors");
const { PAYMENT_STATUSES } = require("./payment.model");

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());

const isCurrency = (value, minimum = 0) =>
  typeof value === "number" && Number.isFinite(value) && value >= minimum;

const rejectUnexpectedFields = (body, allowedFields) => {
  const unexpectedField = Object.keys(body).find(
    (field) => !allowedFields.includes(field)
  );
  return unexpectedField
    ? new ApiError(`${unexpectedField} cannot be sent to this endpoint.`, 400)
    : null;
};

const validateObjectId = (value, fieldName, required = false) => {
  if (required && (value === undefined || value === null || value === "")) {
    return new ApiError(`${fieldName} is required.`, 400);
  }
  if (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    !mongoose.isValidObjectId(value)
  ) {
    return new ApiError(`${fieldName} must be a valid id.`, 400);
  }
  return null;
};

const validatePaymentId = (req, res, next) => {
  const error = validateObjectId(req.params.id, "Payment id", true);
  return error ? next(error) : next();
};

const validatePaymentData = (body, requireAllFields) => {
  const ids = [
    ["subscriptionId", false],
    ["studentId", requireAllFields],
    ["groupId", requireAllFields],
    ["recordedBy", false],
  ];

  for (const [field, required] of ids) {
    const error = validateObjectId(body[field], field, required);
    if (error) return error;
  }

  if (requireAllFields && !isValidDate(body.cycleStart)) {
    return new ApiError("cycleStart must be a valid date.", 400);
  }
  if (requireAllFields && !isValidDate(body.cycleEnd)) {
    return new ApiError("cycleEnd must be a valid date.", 400);
  }
  if (body.cycleStart !== undefined && !isValidDate(body.cycleStart)) {
    return new ApiError("cycleStart must be a valid date.", 400);
  }
  if (body.cycleEnd !== undefined && !isValidDate(body.cycleEnd)) {
    return new ApiError("cycleEnd must be a valid date.", 400);
  }
  if (body.cycleStart !== undefined && body.cycleEnd !== undefined) {
    if (new Date(body.cycleEnd) <= new Date(body.cycleStart)) {
      return new ApiError("cycleEnd must be later than cycleStart.", 400);
    }
  }

  if (requireAllFields && !isCurrency(body.amountDue)) {
    return new ApiError("amountDue must be a non-negative number.", 400);
  }
  if (body.amountDue !== undefined && !isCurrency(body.amountDue)) {
    return new ApiError("amountDue must be a non-negative number.", 400);
  }
  if (body.amountPaid !== undefined && !isCurrency(body.amountPaid)) {
    return new ApiError("amountPaid must be a non-negative number.", 400);
  }
  if (
    body.amountDue !== undefined &&
    body.amountPaid !== undefined &&
    body.amountPaid > body.amountDue
  ) {
    return new ApiError("amountPaid cannot be greater than amountDue.", 400);
  }

  return null;
};

const validateCreatePayment = (req, res, next) => {
  const body = req.body || {};
  const fieldError = rejectUnexpectedFields(body, [
    "subscriptionId",
    "studentId",
    "groupId",
    "cycleStart",
    "cycleEnd",
    "amountDue",
    "amountPaid",
    "recordedBy",
  ]);

  if (fieldError) return next(fieldError);

  const validationError = validatePaymentData(body, true);
  return validationError ? next(validationError) : next();
};

const validateUpdatePayment = (req, res, next) => {
  const body = req.body || {};
  const fieldError = rejectUnexpectedFields(body, [
    "subscriptionId",
    "cycleStart",
    "cycleEnd",
    "amountDue",
  ]);

  if (fieldError) return next(fieldError);

  if (Object.keys(body).length === 0) {
    return next(new ApiError("Provide at least one field to update.", 400));
  }

  const validationError = validatePaymentData(body, false);
  return validationError ? next(validationError) : next();
};

const validateRecordPayment = (req, res, next) => {
  const body = req.body || {};
  const fieldError = rejectUnexpectedFields(body, ["amount", "recordedBy"]);

  if (fieldError) return next(fieldError);

  if (!isCurrency(body.amount, Number.EPSILON)) {
    return next(new ApiError("amount must be greater than zero.", 400));
  }

  const idError = validateObjectId(body.recordedBy, "recordedBy");
  return idError ? next(idError) : next();
};

const validatePaymentList = (req, res, next) => {
  const { page, limit, studentId, groupId, status, cycleStart, cycleEnd } = req.query;

  if (page !== undefined && (!/^\d+$/.test(page) || Number(page) < 1)) {
    return next(new ApiError("page must be a positive integer.", 400));
  }
  if (
    limit !== undefined &&
    (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100)
  ) {
    return next(new ApiError("limit must be an integer between 1 and 100.", 400));
  }

  for (const [fieldName, value] of [
    ["studentId", studentId],
    ["groupId", groupId],
  ]) {
    const idError = validateObjectId(value, fieldName);
    if (idError) return next(idError);
  }

  if (status !== undefined && !PAYMENT_STATUSES.includes(status)) {
    return next(
      new ApiError("status must be unpaid, partial, or paid.", 400)
    );
  }

  if (cycleStart !== undefined && !isValidDate(cycleStart)) {
    return next(new ApiError("cycleStart must be a valid date.", 400));
  }
  if (cycleEnd !== undefined && !isValidDate(cycleEnd)) {
    return next(new ApiError("cycleEnd must be a valid date.", 400));
  }

  return next();
};

module.exports = {
  validatePaymentId,
  validateCreatePayment,
  validateUpdatePayment,
  validateRecordPayment,
  validatePaymentList,
};