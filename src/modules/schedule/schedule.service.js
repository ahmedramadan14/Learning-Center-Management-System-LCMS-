const Schedule = require("./schedule.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const ParentStudent = require("../parentStudent/parentStudent.model");
const ApiError = require("../../utils/ApiErrors");


// Create Schedule
exports.createSchedule = async (data, user) => {
  const group = await Group.findById(data.groupId);
  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher || group.teacherId.toString() !== teacher._id.toString()) {
      throw new ApiError("You can only create schedules for your own groups", 403);
    }
  } else if (user.role === "secretary") {
    const teacher = await Teacher.findOne({ userId: user.createdBy });
    if (!teacher || group.teacherId.toString() !== teacher._id.toString()) {
      throw new ApiError("You can only create schedules for groups belonging to your teacher", 403);
    }
  }

  if (data.type === "weekly" && data.dayOfWeek === undefined) {
    throw new ApiError("dayOfWeek is required for weekly schedules", 400);
  }

  if (data.type === "extra" && !data.specificDate) {
    throw new ApiError("specificDate is required for extra schedules", 400);
  }

  if (data.startTime >= data.endTime) {
    throw new ApiError("End time must be greater than start time", 400);
  }

  const conflictQuery = {
    groupId: data.groupId,
    isActive: true,
    startTime: { $lt: data.endTime },
    endTime: { $gt: data.startTime },
  };

  if (data.type === "weekly") {
    conflictQuery.dayOfWeek = data.dayOfWeek;
  } else {
    conflictQuery.specificDate = data.specificDate;
  }

  const conflict = await Schedule.findOne(conflictQuery);
  if (conflict) {
    throw new ApiError("This group already has an overlapping schedule", 400);
  }

  return await Schedule.create(data);
};
// Get All Schedules
exports.getAllSchedules = async (user) => {
  let groupIdsFilter = [];

  if (!user) return [];

  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) return [];

    const teacherGroups = await Group.find({ teacherId: teacher._id }).select("_id");
    groupIdsFilter = teacherGroups.map((g) => g._id);
  }

  else if (user.role === "secretary") {
    if (!user.createdBy) return [];
    const teacher = await Teacher.findOne({ userId: user.createdBy });
    if (!teacher) return [];

    const teacherGroups = await Group.find({ teacherId: teacher._id }).select("_id");
    groupIdsFilter = teacherGroups.map((g) => g._id);
  }

  else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    groupIdsFilter = student.groups || [];
  }

  else if (user.role === "parent") {
    const parentLinks = await ParentStudent.find({ parentUserId: user._id || user.id }).select("studentId");
    const studentIds = parentLinks.map((p) => p.studentId);

    const students = await Student.find({ _id: { $in: studentIds } }).select("groups");

    const allStudentGroups = students.flatMap((s) => s.groups || []);
    groupIdsFilter = [...new Set(allStudentGroups.map((g) => g.toString()))];
  }
  let query = { isActive: true };
  if (user.role !== "admin") {
    query.groupId = { $in: groupIdsFilter };
  }

  return await Schedule.find(query)
    .populate({
      path: "groupId",
      select: "groupName gradeLevelId teacherId",
      populate: { path: "gradeLevelId", select: "name" },
    });
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

exports.updateSchedule = async (id, data, user) => {
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
  const conflictQuery = {
    _id: { $ne: id },
    groupId: data.groupId || schedule.groupId,
    isActive: true,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (type === "weekly") {
    conflictQuery.dayOfWeek = dayOfWeek;
  } else {
    conflictQuery.specificDate = specificDate;
  }

  const conflict = await Schedule.findOne(conflictQuery);
  if (conflict) {
    throw new ApiError("This group already has an overlapping schedule", 400);
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


// 0 : الأحد      (Sunday)
// 1 : الإثنين   (Monday)
// 2 : الثلاثاء  (Tuesday)
// 3 : الأربعاء  (Wednesday)
// 4 : الخميس   (Thursday)
// 5 : الجمعة   (Friday)
// 6 : السبت    (Saturday)