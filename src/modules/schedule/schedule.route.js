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

router
  .route("/")
  .post(
    authController.allowedTo("admin", "teacher", "secretary"),
    createScheduleValidator,
    validatorMiddleware,
    scheduleController.createSchedule
  )
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student", "parent"),
    scheduleController.getAllSchedules
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student", "parent"),
    getScheduleValidator,
    validatorMiddleware,
    scheduleController.getScheduleById
  )
  .put(
    authController.allowedTo("admin", "teacher", "secretary"),
    updateScheduleValidator,
    validatorMiddleware,
    scheduleController.updateSchedule
  )
  .delete(
    authController.allowedTo("admin", "teacher", "secretary"),
    deleteScheduleValidator,
    validatorMiddleware,
    scheduleController.deleteSchedule
  );

module.exports = router;
