// schedule.route.js
const express = require("express");
const authController = require("../auth/auth.controller.js");

const router = express.Router();
router.use(authController.protect);
const scheduleController = require("./schedule.controller.js");

const {
  createScheduleValidator,
  getScheduleValidator,
  updateScheduleValidator,
  deleteScheduleValidator,
} = require("./schedule.validation.js");

const validatorMiddleware = require("../../middlewares/validatorMiddleware.js");

router
  .route("/")
  .post(
    authController.allowedTo("admin", "teacher", "secretary"),
    createScheduleValidator,
    validatorMiddleware,
    scheduleController.createSchedule
  )
  .get(scheduleController.getAllSchedules);

router
  .route("/:id")
  .get(
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