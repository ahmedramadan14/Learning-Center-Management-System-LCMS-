const Schedule = require("./schedule.model");
const Group = require("../group/group.model");
const ApiError = require("../../utils/ApiErrors");

// Create Schedule
exports.createSchedule = async (data) => {
  const group = await Group.findById(data.groupId);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  if (new Date(data.startTime) >= new Date(data.endTime)) {
    throw new ApiError("End time must be greater than start time", 400);
  }

  return await Schedule.create(data);
};

// Get All Schedules
exports.getAllSchedules = async () => {
  return await Schedule.find().populate("groupId", "groupName");
};

// Get Schedule By Id
exports.getScheduleById = async (id) => {
  const schedule = await Schedule.findById(id).populate(
    "groupId",
    "groupName"
  );

  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  return schedule;
};

// Update Schedule
exports.updateSchedule = async (id, data) => {
  const schedule = await Schedule.findById(id);

  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  if (data.groupId) {
    const group = await Group.findById(data.groupId);

    if (!group) {
      throw new ApiError("Group not found", 404);
    }
  }

  if (data.startTime && data.endTime) {
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw new ApiError("End time must be greater than start time", 400);
    }
  }

  return await Schedule.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Schedule
exports.deleteSchedule = async (id) => {
  const schedule = await Schedule.findById(id);

  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  await Schedule.findByIdAndDelete(id);
};