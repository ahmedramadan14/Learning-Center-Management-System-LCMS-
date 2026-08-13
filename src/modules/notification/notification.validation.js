const mongoose = require("mongoose");

const ApiError = require("../../utils/ApiErrors");
const { NOTIFICATION_TYPES, TARGET_ROLES } = require("./notification.model");

const rejectUnexpectedFields = (body, allowedFields) => {
  const unexpectedField = Object.keys(body).find((field) => !allowedFields.includes(field));
  return unexpectedField
    ? new ApiError(`${unexpectedField} cannot be sent to this endpoint.`, 400)
    : null;
};

const validateObjectId = (value, fieldName, required = false) => {
  if (required && (value === undefined || value === null || value === "")) {
    return new ApiError(`${fieldName} is required.`, 400);
  }

  if (value !== undefined && value !== null && value !== "" && !mongoose.isValidObjectId(value)) {
    return new ApiError(`${fieldName} must be a valid id.`, 400);
  }

  return null;
};

const validateTargets = (targetUserIds) => {
  if (targetUserIds === undefined) {
    return null;
  }

  if (!Array.isArray(targetUserIds)) {
    return new ApiError("targetUserIds must be an array of user ids.", 400);
  }

  const invalidId = targetUserIds.find((id) => !mongoose.isValidObjectId(id));
  return invalidId ? new ApiError("Each targetUserId must be a valid id.", 400) : null;
};

const validateNotificationData = (body, requireContent) => {
  if (requireContent || body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length < 3) {
      return new ApiError("title must be at least 3 characters.", 400);
    }
  }

  if (requireContent || body.body !== undefined) {
    if (typeof body.body !== "string" || body.body.trim().length === 0) {
      return new ApiError("body cannot be empty.", 400);
    }
  }

  if (body.type !== undefined && !NOTIFICATION_TYPES.includes(body.type)) {
    return new ApiError("type must be announcement, payment, exam, or attendance.", 400);
  }

  if (body.targetRole !== undefined && !TARGET_ROLES.includes(body.targetRole)) {
    return new ApiError("targetRole must be a supported audience role.", 400);
  }

  const targetsError = validateTargets(body.targetUserIds);
  if (targetsError) {
    return targetsError;
  }

  if (
    requireContent &&
    body.targetRole === "direct" &&
    (!Array.isArray(body.targetUserIds) || body.targetUserIds.length === 0)
  ) {
    return new ApiError("targetRole direct requires at least one targetUserId.", 400);
  }

  return null;
};

const validateNotificationId = (req, res, next) => {
  const error = validateObjectId(req.params.id, "Notification id", true);
  return error ? next(error) : next();
};

const validateCreateNotification = (req, res, next) => {
  const body = req.body || {};
  const fieldError = rejectUnexpectedFields(body, [
    "title",
    "body",
    "type",
    "targetRole",
    "targetUserIds",
  ]);

  if (fieldError) {
    return next(fieldError);
  }

  const validationError = validateNotificationData(body, true);
  return validationError ? next(validationError) : next();
};

const validateUpdateNotification = (req, res, next) => {
  const body = req.body || {};
  const fieldError = rejectUnexpectedFields(body, ["title", "body", "type", "targetRole", "targetUserIds"]);

  if (fieldError) {
    return next(fieldError);
  }

  if (Object.keys(body).length === 0) {
    return next(new ApiError("Provide at least one field to update.", 400));
  }

  const validationError = validateNotificationData(body, false);
  return validationError ? next(validationError) : next();
};

const validateNotificationList = (req, res, next) => {
  const { page, limit, type, targetRole, targetUserId, createdBy } = req.query;

  if (page !== undefined && (!/^\d+$/.test(page) || Number(page) < 1)) {
    return next(new ApiError("page must be a positive integer.", 400));
  }

  if (limit !== undefined && (!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100)) {
    return next(new ApiError("limit must be an integer between 1 and 100.", 400));
  }

  if (type !== undefined && !NOTIFICATION_TYPES.includes(type)) {
    return next(new ApiError("type must be announcement, payment, exam, or attendance.", 400));
  }

  if (targetRole !== undefined && !TARGET_ROLES.includes(targetRole)) {
    return next(new ApiError("targetRole must be a supported audience role.", 400));
  }

  for (const [fieldName, value] of [
    ["targetUserId", targetUserId],
    ["createdBy", createdBy],
  ]) {
    const idError = validateObjectId(value, fieldName);
    if (idError) {
      return next(idError);
    }
  }

  return next();
};

module.exports = {
  validateNotificationId,
  validateCreateNotification,
  validateUpdateNotification,
  validateNotificationList,
};
