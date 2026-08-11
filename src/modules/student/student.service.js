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
  session.startTransaction();

  try {
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

    const [createdStudent] = await Student.create(
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

    await session.commitTransaction();
    session.endSession();

    return await Student.findById(createdStudent._id)
      .populate("userId", "name phone role email createdBy")
      .populate("teacher");
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw err;
  }
};

const getAllStudents = async (teacherProfileId, queryParams = {}) => {
  let filter = { isActive: true };

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
    .populate("groups", "name gradeLevelId")
    .sort({ createdAt: -1 });
};

const getStudentByCode = async (studentCode, teacherProfileId) => {
  const student = await Student.findOne({ studentCode, isActive: true })
    .populate("userId", "name phone role email isActive")
    .populate("teacher")
    .populate("groups", "name");

  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  if (teacherProfileId) {
    const studentTeacherId = student.teacher?._id || student.teacher;
    if (studentTeacherId.toString() !== teacherProfileId.toString()) {
      throw new ApiError("Not authorized to view this student", 403);
    }
  }

  return student;
};

const updateStudentByCode = async (studentCode, updateData, teacherProfileId) => {
  const student = await getStudentByCode(studentCode, teacherProfileId);

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
const deactivateStudentByCode = async (studentCode, teacherProfileId) => {
  const student = await getStudentByCode(studentCode, teacherProfileId);

  await User.findByIdAndUpdate(student.userId._id, { isActive: false });
  student.isActive = false;
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
  getMyCode,
};