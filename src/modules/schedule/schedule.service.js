const Schedule = require("./schedule.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const ApiError = require("../../utils/ApiErrors");
const Secretary = require("../secretaries/secretary.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");

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

const getParentChildIds = async (user) => {
  const parent = await Parent.findOne({ user: user._id || user.id }).select("_id");
  if (!parent) return [];

  const relations = await ParentStudent.find({ parent: parent._id }).select("student");
  return relations.map((relation) => relation.student);
};

const getVisibleGroupIds = async (user) => {
  if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id }).select("groups");
    return student?.groups || [];
  }

  if (user.role === "parent") {
    const studentIds = await getParentChildIds(user);
    if (studentIds.length === 0) return [];

    const students = await Student.find({ _id: { $in: studentIds } }).select("groups");
    const uniqueIds = new Map();

    students.forEach((student) => {
      (student.groups || []).forEach((groupId) => {
        uniqueIds.set(groupId.toString(), groupId);
      });
    });

    return [...uniqueIds.values()];
  }

  return [];
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

const verifyGroupScheduleViewAccess = async (groupId, user) => {
  if (user.role === "admin") {
    const group = await Group.findById(groupId);
    if (!group) throw new ApiError("Group not found", 404);
    return group;
  }

  if (user.role === "teacher" || user.role === "secretary") {
    return verifyGroupScheduleAccess(groupId, user);
  }

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found", 404);

  const visibleGroupIds = await getVisibleGroupIds(user);
  const canView = visibleGroupIds.some(
    (visibleGroupId) => visibleGroupId.toString() === group._id.toString()
  );

  if (!canView) {
    throw new ApiError("You are not authorized to view this schedule", 403);
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
    groupIdsFilter = await getVisibleGroupIds(user);
  } 
  else if (user.role === "parent") {
    groupIdsFilter = await getVisibleGroupIds(user);
  }

  if (user.role === "admin") {
    // Administrators retain visibility of inactive schedule records too.
    return await Schedule.find({}).populate({
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

  if ((user.role === "student" || user.role === "parent") && !schedule.isActive) {
    throw new ApiError("Schedule not found", 404);
  }

  await verifyGroupScheduleViewAccess(schedule.groupId._id || schedule.groupId, user);

  return schedule;
};

// Update Schedule
exports.updateSchedule = async (id, data, user) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) {
    throw new ApiError("Schedule not found", 404);
  }

  const teacherProfileId = await getAuthorizedTeacherId(user);
  // Verify the existing record first. Without this check a staff member could
  // supply one of their own group IDs and move another teacher's schedule.
  await verifyGroupScheduleAccess(schedule.groupId, user, teacherProfileId);
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
