const asyncHandler = require("../../middlewares/asyncHandler");
const scheduleService = require("./schedule.service");

// Create Schedule
exports.createSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.createSchedule(req.body);

  res.status(201).json({
    success: true,
    message: "Schedule created successfully",
    data: schedule,
  });
});

// Get All Schedules
exports.getAllSchedules = asyncHandler(async (req, res) => {
  const schedules = await scheduleService.getAllSchedules();

  res.status(200).json({
    success: true,
    results: schedules.length,
    data: schedules,
  });
});

// Get Schedule By Id
exports.getScheduleById = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.getScheduleById(req.params.id);

  res.status(200).json({
    success: true,
    data: schedule,
  });
});

// Update Schedule
exports.updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await scheduleService.updateSchedule(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Schedule updated successfully",
    data: schedule,
  });
});

// Delete Schedule
exports.deleteSchedule = asyncHandler(async (req, res) => {
  await scheduleService.deleteSchedule(req.params.id);

  res.status(200).json({
    success: true,
    message: "Schedule deleted successfully",
  });
});