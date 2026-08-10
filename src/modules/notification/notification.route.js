const authController = require("../auth/auth.controller");
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

router.route("/").get(validateNotificationList, getAll).post(
  authController.protect,
  authController.allowedTo("admin", "secretary", "teacher"),
  validateCreateNotification,
  create
);

router
  .route("/:id")
  .get(validateNotificationId, getOne)
  .patch(validateNotificationId, validateUpdateNotification, update)
  .delete(validateNotificationId, remove);

module.exports = router;
