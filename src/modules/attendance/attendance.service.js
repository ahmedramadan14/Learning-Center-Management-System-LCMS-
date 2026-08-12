const attendanceModel = require("./attendance.model");
const Student = require("../student/student.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model");
const Parent = require("../parent/parent.model");
const ApiError = require("../../utils/ApiErrors");

const normalizeDate = (date) => {
  const d = date ? new Date(date) : new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const getStaffAssociatedTeacherId = async (user) => {
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
const verifyGroupOwnership = async (groupId, user) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found", 404);

  if (user.role === "admin") return group;

  const teacherId = await getStaffAssociatedTeacherId(user);

  if (!teacherId || group.teacherId.toString() !== teacherId.toString()) {
    throw new ApiError("You can only access groups belonging to your teacher", 403);
  }

  return group;
};
const createattendance = async (attendData, user) => {
  const student = await Student.findOne({ studentCode: attendData.studentCode, isActive: true });
  if (!student) throw new ApiError("Student not found or inactive", 404);

  await verifyGroupOwnership(attendData.groupId, user);

  const isEnrolledInGroup = student.groups && student.groups.some(gId => gId.toString() === attendData.groupId.toString());
  if (!isEnrolledInGroup) {
    throw new ApiError("This student is not enrolled in this group", 400);
  }

  const attendanceDate = normalizeDate(attendData.date);

  const exists = await attendanceModel.findOne({
    studentId: student._id,
    groupId: attendData.groupId,
    date: attendanceDate,
  });
  if (exists) throw new ApiError("Attendance already recorded for this student on this date", 400);

  return await attendanceModel.create({
    studentId: student._id,
    groupId: attendData.groupId,
    status: attendData.status,
    method: attendData.method || "Manual",
    date: attendanceDate,
  });
};

const updateattendance = async (id, updated, user) => {
  const attendance = await attendanceModel.findById(id);
  if (!attendance) throw new ApiError("Attendance record not found", 404);

  await verifyGroupOwnership(attendance.groupId, user);

  delete updated.studentId;
  delete updated.groupId;
  delete updated.date;

  return await attendanceModel.findByIdAndUpdate(id, updated, { new: true, runValidators: true });
};

const getallattendance = async (user) => {
  let filter = {};
  if (!user) return [];
  if (user.role === "teacher" || user.role === "secretary") {
    const teacherId = await getStaffAssociatedTeacherId(user);
    if (!teacherId) return [];

    const teacherGroups = await Group.find({ teacherId }).select("_id");
    const groupIds = teacherGroups.map((g) => g._id);

    filter = { groupId: { $in: groupIds } };
  } 
  else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    filter = { studentId: student._id };
  } 
  else if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id });
    if (!parent || !parent.students || parent.students.length === 0) return [];
    
    filter = { studentId: { $in: parent.students } };
  }

  return await attendanceModel.find(filter)
    .populate({
      path: "studentId",
      select: "studentCode parentPhone",
      populate: { path: "userId", select: "name phone" }
    })
    .populate("groupId", "groupName")
    .sort({ date: -1 });
};

const getbystudentattendance = async (studentCode, user) => {
  const student = await Student.findOne({ studentCode });
  if (!student) throw new ApiError("Student not found", 404);
  if (user.role === "student") {
    const currentStudent = await Student.findOne({ userId: user._id || user.id });
    if (!currentStudent || currentStudent._id.toString() !== student._id.toString()) {
      throw new ApiError("You can only view your own attendance records", 403);
    }
  } else if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id });
    if (!parent) throw new ApiError("Parent profile not found", 404);

    const isChild = parent.students.some(sId => sId.toString() === student._id.toString());
    if (!isChild) {
      throw new ApiError("You can only view attendance records for your children", 403);
    }
  }

  return await attendanceModel.find({ studentId: student._id })
    .populate("groupId", "groupName")
    .sort({ date: -1 });
};

const deleteattendance = async (id, user) => {
  const attendance = await attendanceModel.findById(id);
  if (!attendance) throw new ApiError("Attendance record not found", 404);

  await verifyGroupOwnership(attendance.groupId, user);

  return await attendanceModel.findByIdAndDelete(id);
};

module.exports = { deleteattendance, getbystudentattendance, getallattendance, updateattendance, createattendance };