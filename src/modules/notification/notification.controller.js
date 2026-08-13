const asyncHandler = require("../../middlewares/asyncHandler");
const {
  createNotification,
  listNotifications,
  getNotificationForUser,
  markNotificationRead,
  markAllNotificationsRead,
  updateNotification,
  deleteNotification,
  getUserId,
} = require("./notification.service");
const {
  emitNotificationCreated,
  emitNotificationUpdated,
  emitNotificationDeleted,
  emitNotificationRead,
  emitNotificationsReadAll,
} = require("../../socket");

const create = asyncHandler(async (req, res) => {
  const notification = await createNotification(req.body, req.user._id, req.user);
  emitNotificationCreated(notification);

  const created = await getNotificationForUser(notification._id, req.user);
  res.status(201).json({
    status: "success",
    data: { notification: created },
  });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await listNotifications(req.query, req.user);

  res.status(200).json({
    status: "success",
    results: result.notifications.length,
    pagination: {
      total: result.total,
      unreadCount: result.unreadCount,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
    data: {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const notification = await getNotificationForUser(req.params.id, req.user);

  res.status(200).json({
    status: "success",
    data: { notification },
  });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.params.id, req.user);
  emitNotificationRead({
    userId: getUserId(req.user),
    notificationId: req.params.id,
    readAt: new Date(),
  });

  res.status(200).json({
    status: "success",
    data: { notification },
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsRead(req.user);
  emitNotificationsReadAll({ userId: getUserId(req.user) });

  res.status(200).json({
    status: "success",
    data: {
      ...result,
      unreadCount: 0,
    },
  });
});

const update = asyncHandler(async (req, res) => {
  const { notification, previousNotification } = await updateNotification(
    req.params.id,
    req.body,
    req.user
  );
  emitNotificationUpdated(notification, previousNotification);

  const updated = await getNotificationForUser(notification._id, req.user);
  res.status(200).json({
    status: "success",
    data: { notification: updated },
  });
});

const remove = asyncHandler(async (req, res) => {
  const notification = await deleteNotification(req.params.id, req.user);
  emitNotificationDeleted(notification);

  res.status(204).send();
});

module.exports = {
  create,
  getAll,
  getOne,
  markRead,
  markAllRead,
  update,
  remove,
};
