const Schedule = require("./schedule.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const ApiError = require("../../utils/ApiErrors");
const Secretary = require("../secretaries/secretary.model");

const getAuthorizedTeacherId = async (user) => {
  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    return teacher._id;
  } else if (user.role === "secretary") {
    const secretary = await Secretary.findOne({ userId: user._id || user.id });
    if (!secretary || !secretary.teacher) {
      throw new ApiError("Secretary is not linked to any valid teacher", 400);
    }
    return secretary.teacher; 
  }
  return null; 
};
const verifyGroupScheduleAccess = async (groupId, user, teacherProfileId = null) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found", 404);

  if (user.role === "admin") return group;

  const authorizedTeacherId = teacherProfileId || (await getAuthorizedTeacherId(user));

  if (!authorizedTeacherId || group.teacherId.toString() !== authorizedTeacherId.toString()) {
    throw new ApiError("Not authorized to manage schedules for this group", 403);
  }

  return group;
};

const checkTeacherOverlappingSchedule = async (teacherId, scheduleData, excludeScheduleId = null) => {
  const teacherGroups = await Group.find({ teacherId }).select("_id");
  const teacherGroupIds = teacherGroups.map((g) => g._id);

  const conflictQuery = {
    groupId: { $in: teacherGroupIds }, 
    isActive: true,
    startTime: { $lt: scheduleData.endTime }, 
    endTime: { $gt: scheduleData.startTime },  
  };

  if (excludeScheduleId) {
    conflictQuery._id = { $ne: excludeScheduleId };
  }

  if (scheduleData.type === "weekly") {
    conflictQuery.dayOfWeek = scheduleData.dayOfWeek;
  } else {
    conflictQuery.specificDate = scheduleData.specificDate;
  }

  const conflict = await Schedule.findOne(conflictQuery).populate("groupId", "groupName");
  if (conflict) {
    throw new ApiError(
      `Teacher has an overlapping schedule with group: ${conflict.groupId.groupName}`,
      400
    );
  }
};

exports.createSchedule = async (data, user) => {
  const teacherId = await getAuthorizedTeacherId(user);
  const group = await verifyGroupScheduleAccess(data.groupId, user, teacherId);

  // Validation
  if (data.type === "weekly" && data.dayOfWeek === undefined) {
    throw new ApiError("dayOfWeek is required for weekly schedules", 400);
  }
  if (data.type === "extra" && !data.specificDate) {
    throw new ApiError("specificDate is required for extra schedules", 400);
  }
  if (data.startTime >= data.endTime) {
    throw new ApiError("End time must be greater than start time", 400);
  }

  // Check Overlapping for the TEACHER (Not just the group)
  await checkTeacherOverlappingSchedule(group.teacherId, data);

  return await Schedule.create(data);
};

exports.getAllSchedules = async (user) => {
  let groupIdsFilter = [];

  if (!user) return [];

  if (user.role === "teacher" || user.role === "secretary") {
    const teacherProfileId = await getAuthorizedTeacherId(user);
    if (!teacherProfileId) return [];

    const teacherGroups = await Group.find({ teacherId: teacherProfileId }).select("_id");
    groupIdsFilter = teacherGroups.map((g) => g._id);
  } 
  else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    
    const studentGroups = await Group.find({ _id: { $in: student.groups || [] } }).select("_id");
    groupIdsFilter = studentGroups.map(g => g._id);
  } 
  else if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id });
    if (!parent || !parent.students || parent.students.length === 0) return [];

    const linkedStudentsGroups = await Student.find({ _id: { $in: parent.students } }).select("groups");
    const allGroups = linkedStudentsGroups.flatMap((s) => s.groups || []);
    groupIdsFilter = [...new Set(allGroups.map((g) => g.toString()))]; 
  }

  if (user.role === "admin") {
    return await Schedule.find({ isActive: true }).populate({
      path: "groupId",
      select: "groupName gradeLevelId teacherId",
      populate: { path: "gradeLevelId", select: "name" },
    });
  }

  return await Schedule.find({ isActive: true, groupId: { $in: groupIdsFilter } }).populate({
    path: "groupId",
    select: "groupName gradeLevelId teacherId",
    populate: { path: "gradeLevelId", select: "name" },
  });
};

// Get Schedule By Id
exports.getScheduleById = async (id, user) => {
  const schedule = await Schedule.findById(id).populate("groupId", "groupName teacherId");

  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  if (user.role === "teacher" || user.role === "secretary") {
    await verifyGroupScheduleAccess(schedule.groupId._id || schedule.groupId, user);
  } 

  return schedule;
};

// Update Schedule
exports.updateSchedule = async (id, data, user) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  const teacherProfileId = await getAuthorizedTeacherId(user);
  const targetGroupId = data.groupId || schedule.groupId;
  const group = await verifyGroupScheduleAccess(targetGroupId, user, teacherProfileId);

  // Validation
  const type = data.type || schedule.type;
  const dayOfWeek = data.dayOfWeek !== undefined ? data.dayOfWeek : schedule.dayOfWeek;
  const specificDate = data.specificDate || schedule.specificDate;

  if (type === "weekly" && dayOfWeek === undefined) {
    throw new ApiError("dayOfWeek is required for weekly schedules", 400);
  }
  if (type === "extra" && !specificDate) {
    throw new ApiError("specificDate is required for extra schedules", 400);
  }

  const startTime = data.startTime || schedule.startTime;
  const endTime = data.endTime || schedule.endTime;

  if (startTime >= endTime) {
    throw new ApiError("End time must be greater than start time", 400);
  }

  // Check Overlapping for the TEACHER (Across all their groups)
  const overlappingData = { type, dayOfWeek, specificDate, startTime, endTime };
  await checkTeacherOverlappingSchedule(group.teacherId, overlappingData, id);

  return await Schedule.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Schedule
exports.deleteSchedule = async (id, user) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  await verifyGroupScheduleAccess(schedule.groupId, user);

  await Schedule.findByIdAndDelete(id);
};