const express = require("express");

const {
  create,
  getAll,
  getOne,
  markRead,
  markAllRead,
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

const authController = require("../auth/auth.controller");

router.use(authController.protect);

router
  .route("/")
  .get(validateNotificationList, getAll)
  .post(
    authController.allowedTo("admin", "teacher", "secretary"),
    validateCreateNotification,
    create
  );

// These static paths must stay above /:id so Express does not treat
// "read-all" as an id.
router.patch("/read-all", markAllRead);
router.patch("/:id/read", validateNotificationId, markRead);

router
  .route("/:id")
  .get(validateNotificationId, getOne)
  .patch(
    authController.allowedTo("admin"),
    validateNotificationId,
    validateUpdateNotification,
    update
  )
  .delete(authController.allowedTo("admin"), validateNotificationId, remove);

module.exports = router;
