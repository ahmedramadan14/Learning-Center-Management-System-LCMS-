const ApiError = require("../../utils/ApiErrors");
const Notification = require("./notification.model");

const pick = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }

    return result;
  }, {});

const findNotificationById = async (id) => {
  const notification = await Notification.findById(id);

  if (!notification) {
    throw new ApiError("Notification not found.", 404);
  }

  return notification;
};

const createNotification = async (data, createdBy) => {
  const notificationData = pick(data, [
    "title",
    "body",
    "type",
    "targetRole",
    "targetUserIds",
    "createdBy",
  ]);

  if (createdBy) {
    notificationData.createdBy = createdBy;
  }

  return Notification.create(notificationData);
};

const listNotifications = async (query) => {
  const filter = {};

  if (query.type) {
    filter.type = query.type;
  }

  if (query.targetRole) {
    filter.targetRole = query.targetRole;
  }

  if (query.targetUserId) {
    filter.targetUserIds = query.targetUserId;
  }

  if (query.createdBy) {
    filter.createdBy = query.createdBy;
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
};

const updateNotification = async (id, data) => {
  const notification = await findNotificationById(id);

  Object.assign(notification, pick(data, ["title", "body", "type", "targetRole", "targetUserIds"]));
  await notification.save();

  return notification;
};

const deleteNotification = async (id) => {
  const notification = await findNotificationById(id);
  await notification.deleteOne();
};

module.exports = {
  createNotification,
  listNotifications,
  findNotificationById,
  updateNotification,
  deleteNotification,
};
