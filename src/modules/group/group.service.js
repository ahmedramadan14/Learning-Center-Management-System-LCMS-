const Group = require("./group.model");
const Grade = require("../grade/grade.model");
const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model");
const ApiError = require("../../utils/ApiErrors");
const Schedule = require("../schedule/schedule.model");
const Student = require("../student/student.model");

const getTeacherProfileFromUser = async (user) => {
  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    return teacher;
  }

  if (user.role === "secretary") {
    const secretary = await Secretary.findOne({ userId: user._id || user.id });
    if (secretary && secretary.teacher) {
      return await Teacher.findById(secretary.teacher);
    }
    if (user.createdBy) {
      return await Teacher.findOne({ userId: user.createdBy });
    }
    throw new ApiError("Secretary is not linked to any valid teacher", 400);
  }

  return null;
};


const verifyGroupOwnership = async (groupId, user) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found", 404);

  if (user.role === "admin") return group;

  const teacher = await getTeacherProfileFromUser(user);
  if (!teacher || group.teacherId.toString() !== teacher._id.toString()) {
    throw new ApiError("You are not authorized to manage or view this group", 403);
  }

  return group;
};

// Create Group
exports.createGroup = async (data) => {
  const grade = await Grade.findById(data.gradeLevelId);
  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  const teacher = await Teacher.findById(data.teacherId);
  if (!teacher) {
    throw new ApiError("Teacher not found", 404);
  }

  const groupExists = await Group.findOne({
    groupName: data.groupName,
    teacherId: data.teacherId,
  });

  if (groupExists) {
    throw new ApiError("Group with this name already exists for this teacher", 400);
  }

  return await Group.create(data);
};

// Get All Groups
exports.getAllGroups = async (user) => {
  let filter = {};

  if (user.role === "teacher" || user.role === "secretary") {
    const teacher = await getTeacherProfileFromUser(user);
    if (!teacher) return [];
    filter = { teacherId: teacher._id };
  } else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    filter = { _id: { $in: student.groups || [] } };
  }

  return await Group.find(filter)
    .populate("gradeLevelId", "name")
    .populate("teacherId");
};

// Get Group By Id
exports.getGroupById = async (id, user) => {
  const group = await verifyGroupOwnership(id, user);
  return await group.populate(["gradeLevelId", "teacherId"]);
};

// Update Group
exports.updateGroup = async (id, data, user) => {
  await verifyGroupOwnership(id, user);

  if (data.gradeLevelId) {
    const grade = await Grade.findById(data.gradeLevelId);
    if (!grade) throw new ApiError("Grade not found", 404);
  }

  if (data.groupName) {
    const group = await Group.findById(id);
    const groupExists = await Group.findOne({
      groupName: data.groupName,
      teacherId: group.teacherId,
      _id: { $ne: id },
    });

    if (groupExists) {
      throw new ApiError("Group with this name already exists for this teacher", 400);
    }
  }

  delete data.teacherId; 

  return await Group.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Group
exports.deleteGroup = async (id, user) => {
  await verifyGroupOwnership(id, user);

  const schedulesUsingGroup = await Schedule.exists({ groupId: id });
  if (schedulesUsingGroup) {
    throw new ApiError("Cannot delete group: it still has schedules attached", 400);
  }

  await Group.findByIdAndDelete(id);
};

// Add Student To Group
exports.addStudentToGroup = async (groupId, studentCode, user) => {
  const group = await verifyGroupOwnership(groupId, user);

  const student = await Student.findOne({ studentCode, isActive: true });
  if (!student) throw new ApiError("Student not found or inactive", 404);


  if (!student.groups) student.groups = [];

  const isAlreadyInGroup = student.groups.some(
    (gId) => gId.toString() === groupId.toString()
  );

  if (isAlreadyInGroup) {
    throw new ApiError("Student is already enrolled in this group", 400);
  }

  const currentEnrolled = await Student.countDocuments({ groups: groupId, isActive: true });
  if (currentEnrolled >= group.maxCapacity) {
    throw new ApiError("Group has reached its maximum student capacity", 400);
  }

  student.groups.push(groupId);
  await student.save();

  await student.populate("userId", "name phone role");

  return student;
};

// Remove Student From Group
exports.removeStudentFromGroup = async (groupId, studentCode, user) => {
  await verifyGroupOwnership(groupId, user);

  const student = await Student.findOne({ studentCode, isActive: true });
  if (!student) throw new ApiError("Student not found", 404);

  if (!student.groups || !student.groups.some((id) => id.toString() === groupId.toString())) {
    throw new ApiError("Student does not belong to this group", 400);
  }

  student.groups = student.groups.filter((id) => id.toString() !== groupId.toString());
  await student.save();

  return await Student.findById(student._id).populate("userId", "name phone role email");
};

// Get Students In Group
exports.getGroupStudents = async (groupId, user) => {
  await verifyGroupOwnership(groupId, user);

  return await Student.find({
    groups: groupId,
    isActive: true,
  }).populate("userId", "name phone role email");
};