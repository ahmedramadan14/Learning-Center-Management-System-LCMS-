const Group = require("./group.model");
const Grade = require("../grade/grade.model");
const Teacher = require("../teacher/teacher.model");
const ApiError = require("../../utils/ApiErrors");
const Schedule = require("../schedule/schedule.model");
const Student = require('../student/student.model')

// Create Group
exports.createGroup = async (data) => {
  // Check Grade
  const grade = await Grade.findById(data.gradeLevelId);

  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  // Check Teacher
  const teacher = await Teacher.findById(data.teacherId);

  if (!teacher) {
    throw new ApiError("Teacher not found", 404);
  }

  // Check Duplicate Group Name
  const groupExists = await Group.findOne({
    groupName: data.groupName,
  });

  if (groupExists) {
    throw new ApiError("Group already exists", 400);
  }

  const group = await Group.create(data);

  return group;
};

// Get All Groups
exports.getAllGroups = async (user) => {
let filter = {};
if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) return [];
    filter = { teacherId: teacher._id };
  } 
  
  else if (user.role === "secretary") {
    if (!user.createdBy) return [];
    const teacher = await Teacher.findOne({ userId: user.createdBy });
    if (!teacher) return [];
    filter = { teacherId: teacher._id };
  } 
  
  else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    filter = { _id: { $in: student.groups || [] } };
  }
  

  return await Group.find(filter)
    .populate("gradeLevelId", "name")
    .populate("teacherId");
};

// Get Group By Id
exports.getGroupById = async (id) => {
  const group = await Group.findById(id)
    .populate("gradeLevelId", "name")
    .populate("teacherId");

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  return group;
};

// Update Group
exports.updateGroup = async (id, data) => {
  const group = await Group.findById(id);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  if (data.gradeLevelId) {
    const grade = await Grade.findById(data.gradeLevelId);

    if (!grade) {
      throw new ApiError("Grade not found", 404);
    }
  }

  if (data.teacherId) {
    const teacher = await Teacher.findById(data.teacherId);

    if (!teacher) {
      throw new ApiError("Teacher not found", 404);
    }
  }

  if (data.groupName) {
    const groupExists = await Group.findOne({
      groupName: data.groupName,
      _id: { $ne: id },
    });

    if (groupExists) {
      throw new ApiError("Group already exists", 400);
    }
  }

  return await Group.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteGroup = async (id) => {
  const group = await Group.findById(id);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  const schedulesUsingGroup = await Schedule.exists({ groupId: id });
  if (schedulesUsingGroup) {
    throw new ApiError(
      "Cannot delete group: it still has schedules attached",
      400
    );
  }

  await Group.findByIdAndDelete(id);

  return;
};