const Group = require("./group.model");
const Grade = require("../grade/grade.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const ApiError = require("../../utils/ApiErrors");

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
exports.getAllGroups = async () => {
  return await Group.find()
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

// Delete Group
exports.deleteGroup = async (id) => {
  const group = await Group.findById(id);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  await Group.findByIdAndDelete(id);

  return;
};

// Add Student To Group
exports.addStudentToGroup = async (groupId, studentCode) => {
  // Check Group
  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  // Check Student
  const student = await Student.findOne({
    studentCode,
    isActive: true,
  });

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  // Check if student already belongs to this group
  if (student.groups && student.groups.includes(groupId)) {
    throw new ApiError("Student already belongs to this group", 400);
  }

  // Check group capacity
  const studentsCount = await Student.countDocuments({
    groups: groupId,
    isActive: true,
  });

  if (studentsCount >= group.maxCapacity) {
    throw new ApiError("Group has reached maximum capacity", 400);
  }

  // Add group to student's groups
  if (!student.groups) {
    student.groups = [];
  }

  student.groups.push(groupId);

  await student.save();

  return await Student.findById(student._id).populate(
    "userId",
    "name phone role email"
  );
};

// Remove Student From Group
exports.removeStudentFromGroup = async (groupId, studentCode) => {
  // Check Group
  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  // Check Student
  const student = await Student.findOne({
    studentCode,
    isActive: true,
  });

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  // Check if student belongs to this group
  if (!student.groups || !student.groups.some(
    (id) => id.toString() === groupId.toString()
  )) {
    throw new ApiError("Student does not belong to this group", 400);
  }

  // Remove group from student's groups
  student.groups = student.groups.filter(
    (id) => id.toString() !== groupId.toString()
  );

  await student.save();

  return await Student.findById(student._id).populate(
    "userId",
    "name phone role email"
  );
};

// Get Students In Group
exports.getGroupStudents = async (groupId) => {
  // Check Group
  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError("Group not found", 404);
  }

  // Get active students that belong to this group
  return await Student.find({
    groups: groupId,
    isActive: true,
  }).populate("userId", "name phone role email");
};