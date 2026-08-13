// schedule.route.js
const express = require("express");
const authController = require("../auth/auth.controller.js");

const router = express.Router();
router.use(authController.protect);
const scheduleController = require("./schedule.controller");

const {
  createScheduleValidator,
  getScheduleValidator,
  updateScheduleValidator,
  deleteScheduleValidator,
} = require("./schedule.validation");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");

router
  .route("/")
  .post(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Schedule"),
    createScheduleValidator,
    validatorMiddleware,
    scheduleController.createSchedule
  )
  .get(authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Schedule"), scheduleController.getAllSchedules);

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Schedule"), getScheduleValidator,
    validatorMiddleware,
    scheduleController.getScheduleById
  )
  .put(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Schedule"),
    updateScheduleValidator,
    validatorMiddleware,
    scheduleController.updateSchedule
  )
  .delete(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Schedule"),
    deleteScheduleValidator,
    validatorMiddleware,
    scheduleController.deleteSchedule
  );

module.exports = router;
