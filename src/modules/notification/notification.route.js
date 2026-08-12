const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require("./notification.controller");
const {
  validateNotificationId,
  validateCreateNotification,
  validateUpdateNotification,
  validateNotificationList,
} = require("./notification.validation");

const router = express.Router();

router.route("/").get(validateNotificationList, getAll).post(validateCreateNotification, create);

router
  .route("/:id")
  .get(validateNotificationId, getOne)
  .patch(validateNotificationId, validateUpdateNotification, update)
  .delete(validateNotificationId, remove);

module.exports = router;
