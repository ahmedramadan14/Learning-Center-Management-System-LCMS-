const asyncHandler = require("../../middlewares/asyncHandler");
const scheduleService = require("./schedule.service");

exports.createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body, req.user);
  res.status(201).json({
    success: true,
    message: "Schedule created successfully",
    data: schedule,
  });
});

exports.getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await scheduleService.getAllSchedules(req.user);
  res.status(200).json({
    success: true,
    results: schedules.length,
    data: schedules,
  });
});

exports.getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: schedule,
  });
});

exports.updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.updateSchedule(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: "Schedule updated successfully",
    data: schedule,
  });
});

exports.deleteSchedule = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Schedule deleted successfully",
  });
});