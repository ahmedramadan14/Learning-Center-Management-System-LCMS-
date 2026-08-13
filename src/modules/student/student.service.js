const mongoose = require("mongoose");
const Student = require("./student.model");
const User = require("../user/user.model");
const Group = require("../group/group.model");
const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/ApiErrors");
const { generateUniqueStudentCode } = require("./student.utils");

const createStudent = async (data) => {
  const {
    name, username, phone, password,
    firstName, lastName, parentPhone, gender, grade,
    groupId, teacherProfileId, teacherUserId, createdById
  } = data;

  const session = await mongoose.startSession();
  let createdStudent;

  try {
    await session.withTransaction(async () => {
    if (groupId) {
      const group = await Group.findById(groupId)
        .select("teacherId maxCapacity")
        .session(session);
      if (!group) {
        throw new ApiError("Group not found", 404);
      }
      if (!teacherProfileId || group.teacherId.toString() !== teacherProfileId.toString()) {
        throw new ApiError("You can only enroll a student in a group owned by the assigned teacher", 403);
      }

      // Creating a student with a group must respect the same capacity rule as
      // the dedicated enrollment endpoint.
      const enrolledStudents = await Student.countDocuments({
        groups: group._id,
        isActive: true,
      }).session(session);

      if (enrolledStudents >= group.maxCapacity) {
        throw new ApiError("Group has reached its maximum student capacity", 400);
      }

      // Every enrollment transaction updates the group record. This gives
      // concurrent enrollment attempts a shared write target, so MongoDB can
      // retry one attempt with the latest capacity instead of overbooking.
      await Group.updateOne(
        { _id: group._id },
        { $currentDate: { updatedAt: true } },
        { session, timestamps: false }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const displayName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || username || "Student");

    const [user] = await User.create(
      [
        {
          name: displayName,
          phone,
          password: hashedPassword,
          role: "student",
          createdBy: teacherUserId,
          isApproved: true,
          isActive: true,
        },
      ],
      { session }
    );

    const studentCode = await generateUniqueStudentCode(session);

    [createdStudent] = await Student.create(
      [
        {
          userId: user._id,
          studentCode,
          parentPhone,
          gender,
          grade,
          teacher: teacherProfileId,
          createdById: createdById,
          ...(groupId && { groups: [groupId] }),
        },
      ],
      { session }
    );

    });
  } finally {
    await session.endSession();
  }

  return await Student.findById(createdStudent._id)
    .populate("userId", "name phone role email createdBy")
    .populate("teacher");
};

const getAllStudents = async (
  teacherProfileId,
  queryParams = {},
  includeInactive = false
) => {
  let filter = includeInactive ? {} : { isActive: true };

  if (teacherProfileId) {
    const teacherGroups = await Group.find({ teacherId: teacherProfileId }).select("_id");
    const groupIds = teacherGroups.map((group) => group._id);

    filter = {
      ...filter,
      $or: [
        { teacher: teacherProfileId },
        { groups: { $in: groupIds } }
      ],
    };
  }
  return await Student.find(filter)
    .populate("userId", "name phone role email isActive")
    .populate("teacher")
    .populate("groups", "groupName gradeLevelId")
    .sort({ createdAt: -1 });
};

const getStudentByCode = async (studentCode, teacherProfileId, includeInactive = false) => {
  const student = await Student.findOne({
    studentCode,
    ...(!includeInactive && { isActive: true }),
  })
    .populate("userId", "name phone role email isActive")
    .populate("teacher")
    .populate("groups", "groupName");

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  if (teacherProfileId) {
    const studentTeacherId = student.teacher?._id || student.teacher;
    const isDirectlyAssigned =
      studentTeacherId && studentTeacherId.toString() === teacherProfileId.toString();
    const belongsToTeacherGroup = await Group.exists({
      _id: { $in: student.groups || [] },
      teacherId: teacherProfileId,
    });

    if (!isDirectlyAssigned && !belongsToTeacherGroup) {
      throw new ApiError("Not authorized to view this student", 403);
    }
  }

  return student;
};

const updateStudentByCode = async (
  studentCode,
  updateData,
  teacherProfileId,
  includeInactive = false
) => {
  const student = await getStudentByCode(studentCode, teacherProfileId, includeInactive);

  if (updateData.name || updateData.phone) {
    await User.findByIdAndUpdate(student.userId._id, {
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.phone && { phone: updateData.phone }),
    });
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    student._id,
    {
      ...(updateData.parentPhone && { parentPhone: updateData.parentPhone }),
      ...(updateData.grade && { grade: updateData.grade }),
      ...(updateData.gender && { gender: updateData.gender }),
    },
    { new: true }
  )
    .populate("userId", "name phone role email isActive")
    .populate("teacher");

  return updatedStudent;
};
const deactivateStudentByCode = async (studentCode, teacherProfileId, includeInactive = false) => {
  const student = await getStudentByCode(studentCode, teacherProfileId, includeInactive);

  await User.findByIdAndUpdate(student.userId._id, { isActive: false });
  student.isActive = false;
  await student.save();

  return student;
};

const activateStudentByCode = async (studentCode) => {
  const student = await getStudentByCode(studentCode, null, true);

  await User.findByIdAndUpdate(student.userId._id, { isActive: true });
  student.isActive = true;
  await student.save();

  return student;
};

const getMyCode = async (userId) => {
  const student = await Student.findOne({ userId }).select("studentCode");

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  return student.studentCode;
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentByCode,
  updateStudentByCode,
  deactivateStudentByCode,
  activateStudentByCode,
  getMyCode,
};
