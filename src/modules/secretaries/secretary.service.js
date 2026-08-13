const Secretary = require("./secretary.model");
const User = require("../user/user.model");
const Teacher = require("../teacher/teacher.model");
const ApiError = require("../../utils/ApiErrors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const createSecretary = async (data) => {
  const { name, email, phone, password, teacherId, teacher, department, permissions } = data;
  const assignedTeacherId = teacherId || teacher;

  if (!assignedTeacherId) {
    throw new ApiError("Teacher ID is required for creating a secretary", 400);
  }

  const teacherExists = await Teacher.findById(assignedTeacherId);
  if (!teacherExists) {
    throw new ApiError("Teacher profile not found", 404);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await User.create(
      [
        {
          name,
          email, 
          phone,
          password: hashedPassword,
          role: "secretary",
          createdBy: teacherExists.userId,
          isApproved: true,
          isActive: true,
        },
      ],
      { session }
    );

    const [createdSecretary] = await Secretary.create(
      [
        {
          userId: user._id,
          teacher: assignedTeacherId,
          department: department || "General",
          permissions: permissions || [],
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return await Secretary.findById(createdSecretary._id).populate(
      "userId",
      "name email phone role"
    );
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// Get All Secretaries for current teacher
const getAllSecretaries = async (currentUser) => {
  let filter = {};

  if (currentUser.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: currentUser._id || currentUser.id });
    if (!teacher) return [];
    filter = { teacher: teacher._id };
  }

  return await Secretary.find(filter)
    .populate("userId", "name email phone role")
    .populate({
      path: "teacher",
      populate: { path: "userId", select: "name email phone" },
    });
};

// Get One Secretary
const getOneSecretary = async (id, currentUser) => {
  const secretary = await Secretary.findById(id)
    .populate("userId", "name email phone role")
    .populate({
      path: "teacher",
      populate: { path: "userId", select: "name email phone" },
    });

  if (!secretary) throw new ApiError("Secretary not found", 404);

  if (currentUser.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: currentUser._id || currentUser.id });
    if (!teacher || secretary.teacher._id.toString() !== teacher._id.toString()) {
      throw new ApiError("Not authorized to view this secretary", 403);
    }
  }

  return secretary;
};

// Update One Secretary
const updateOneSecretary = async (id, data, currentUser) => {
  const secretary = await getOneSecretary(id, currentUser);

  if (data.name || data.phone || data.email) {
    await User.findByIdAndUpdate(secretary.userId._id, {
      ...(data.name && { name: data.name }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email && { email: data.email }),
    });
  }

  return await Secretary.findByIdAndUpdate(
    id,
    {
      ...(data.department && { department: data.department }),
      ...(data.permissions && { permissions: data.permissions }),
    },
    { new: true, runValidators: true }
  ).populate("userId", "name email phone role");
};

// Delete One Secretary
const deleteOneSecretary = async (id, currentUser) => {
  const secretary = await getOneSecretary(id, currentUser);

  await User.findByIdAndDelete(secretary.userId._id);
  await Secretary.findByIdAndDelete(id);

  return secretary;
};

module.exports = {
  createSecretary,
  getAllSecretaries,
  getOneSecretary,
  deleteOneSecretary,
  updateOneSecretary,
};
