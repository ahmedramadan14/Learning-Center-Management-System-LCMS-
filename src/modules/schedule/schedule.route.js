const express = require("express");

const router = express.Router();

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
    updateScheduleValidator,
    validatorMiddleware,
    scheduleController.updateSchedule
  )
  .delete(
    deleteScheduleValidator,
    validatorMiddleware,
    scheduleController.deleteSchedule
  );

module.exports = router;