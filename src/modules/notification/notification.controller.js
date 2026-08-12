const asyncHandler = require("../../middlewares/asyncHandler");
const {
  createNotification,
  listNotifications,
  findNotificationById,
  updateNotification,
  deleteNotification,
} = require("./notification.service");

const getActorId = (req) => req.user?._id || req.body.createdBy;

const create = asyncHandler(async (req, res) => {
  const notification = await createNotification(req.body, getActorId(req));

  res.status(201).json({
    status: "success",
    data: { notification },
  });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await listNotifications(req.query);

  res.status(200).json({
    status: "success",
    results: result.notifications.length,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
    data: { notifications: result.notifications },
  });
});

const getOne = asyncHandler(async (req, res) => {
  const notification = await findNotificationById(req.params.id);

  res.status(200).json({
    status: "success",
    data: { notification },
  });
});

const update = asyncHandler(async (req, res) => {
  const notification = await updateNotification(req.params.id, req.body);

  res.status(200).json({
    status: "success",
    data: { notification },
  });
});

const remove = asyncHandler(async (req, res) => {
  await deleteNotification(req.params.id);

  res.status(204).send();
});

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
