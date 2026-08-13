const mongoose = require("mongoose");
const Group = require("./group.model");
const Grade = require("../grade/grade.model");
const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model");
const ApiError = require("../../utils/ApiErrors");
const Schedule = require("../schedule/schedule.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");

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

const verifyGroupManagementAccess = async (groupId, user) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found", 404);

  if (user.role === "admin") return group;

  const teacher = await getTeacherProfileFromUser(user);
  if (!teacher || group.teacherId.toString() !== teacher._id.toString()) {
    throw new ApiError("You are not authorized to manage or view this group", 403);
  }

  return group;
};

const verifyGroupViewAccess = async (groupId, user) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found", 404);

  if (user.role === "admin") return group;

  if (user.role === "teacher" || user.role === "secretary") {
    return verifyGroupManagementAccess(groupId, user);
  }

  const visibleGroupIds = await getVisibleGroupIds(user);
  const canView = visibleGroupIds.some(
    (visibleGroupId) => visibleGroupId.toString() === group._id.toString()
  );

  if (!canView) {
    throw new ApiError("You are not authorized to view this group", 403);
  }

  return group;
};

// Create Group
exports.createGroup = async (data, user) => {
  const groupData = { ...data };

  if (user.role === "admin") {
    if (!groupData.teacherId) {
      throw new ApiError("Teacher ID is required when admin creates a group", 400);
    }
  } else {
    const teacher = await getTeacherProfileFromUser(user);
    if (!teacher) {
      throw new ApiError("Linked teacher profile not found", 404);
    }

    // Staff accounts always create groups for their linked teacher, regardless
    // of a teacherId supplied in the request body.
    groupData.teacherId = teacher._id;
  }

  const grade = await Grade.findById(groupData.gradeLevelId);
  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  const teacher = await Teacher.findById(groupData.teacherId);
  if (!teacher) {
    throw new ApiError("Teacher not found", 404);
  }

  const groupExists = await Group.findOne({
    groupName: groupData.groupName,
    teacherId: groupData.teacherId,
  });

  if (groupExists) {
    throw new ApiError("Group with this name already exists for this teacher", 400);
  }

  return await Group.create(groupData);
};

// Get All Groups
exports.getAllGroups = async (user) => {
  let filter = {};

  if (user.role === "teacher" || user.role === "secretary") {
    const teacher = await getTeacherProfileFromUser(user);
    if (!teacher) return [];
    filter = { teacherId: teacher._id };
  } else if (user.role === "student") {
    filter = { _id: { $in: await getVisibleGroupIds(user) } };
  } else if (user.role === "parent") {
    filter = { _id: { $in: await getVisibleGroupIds(user) } };
  }

  return await Group.find(filter)
    .populate("gradeLevelId", "name")
    .populate({
      path: "teacherId",
      populate: { path: "userId", select: "name email phone" },
    });
};

// Get Group By Id
exports.getGroupById = async (id, user) => {
  const group = await verifyGroupViewAccess(id, user);
  return await group.populate([
    { path: "gradeLevelId", select: "name" },
    { path: "teacherId", populate: { path: "userId", select: "name email phone" } },
  ]);
};

// Update Group
exports.updateGroup = async (id, data, user) => {
  await verifyGroupManagementAccess(id, user);

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
  await verifyGroupManagementAccess(id, user);

  const schedulesUsingGroup = await Schedule.exists({ groupId: id });
  if (schedulesUsingGroup) {
    throw new ApiError("Cannot delete group: it still has schedules attached", 400);
  }

  const studentsInGroup = await Student.exists({ groups: id });
  if (studentsInGroup) {
    throw new ApiError("Cannot delete group: it still has enrolled students", 400);
  }

  await Group.findByIdAndDelete(id);
};

// Add Student To Group
exports.addStudentToGroup = async (groupId, studentCode, user) => {
  await verifyGroupManagementAccess(groupId, user);
  const actingTeacher = user.role !== "admin"
    ? await getTeacherProfileFromUser(user)
    : null;
  const session = await mongoose.startSession();
  let enrolledStudentId;

  try {
    await session.withTransaction(async () => {
      const group = await Group.findById(groupId).session(session);
      if (!group) throw new ApiError("Group not found", 404);

      const student = await Student.findOne({ studentCode, isActive: true }).session(session);
      if (!student) throw new ApiError("Student not found or inactive", 404);

      if (actingTeacher) {
        const assignedTeacherId = student.teacher;
        if (assignedTeacherId && assignedTeacherId.toString() !== actingTeacher._id.toString()) {
          throw new ApiError("You cannot enroll a student assigned to another teacher", 403);
        }

        // A newly registered student may be unassigned. Enrolling them into
        // this class establishes the correct teacher ownership.
        if (!assignedTeacherId) student.teacher = group.teacherId;
      }

      if (!student.groups) student.groups = [];
      const isAlreadyInGroup = student.groups.some(
        (enrolledGroupId) => enrolledGroupId.toString() === group._id.toString()
      );

      if (isAlreadyInGroup) {
        throw new ApiError("Student is already enrolled in this group", 400);
      }

      const currentEnrolled = await Student.countDocuments({
        groups: group._id,
        isActive: true,
      }).session(session);
      if (currentEnrolled >= group.maxCapacity) {
        throw new ApiError("Group has reached its maximum student capacity", 400);
      }

      // A shared group write serializes capacity decisions across concurrent
      // requests. The transaction API retries write conflicts automatically.
      const touchResult = await Group.updateOne(
        { _id: group._id },
        { $currentDate: { updatedAt: true } },
        { session, timestamps: false }
      );
      if (touchResult.matchedCount !== 1) {
        throw new ApiError("Group not found", 404);
      }

      student.groups.push(group._id);
      await student.save({ session });
      enrolledStudentId = student._id;
    });
  } finally {
    await session.endSession();
  }

  return await Student.findById(enrolledStudentId).populate("userId", "name phone role");
};

// Remove Student From Group
exports.removeStudentFromGroup = async (groupId, studentCode, user) => {
  await verifyGroupManagementAccess(groupId, user);

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
  await verifyGroupManagementAccess(groupId, user);

  return await Student.find({
    groups: groupId,
    isActive: true,
  }).populate("userId", "name phone role email");
};
