const mongoose = require("mongoose");
const Teacher = require("./teacher.model");
const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/ApiErrors");

const ALLOWED_UPDATE_FIELDS = ["description", "subject"];

const resolvedApprovalStatus = (user) => {
  if (["pending", "approved", "rejected"].includes(user?.approvalStatus)) {
    return user.approvalStatus;
  }

  // Existing accounts predate approvalStatus. Preserve their current access
  // behavior instead of requiring a data migration before they can be listed.
  return user?.isApproved === true ? "approved" : "pending";
};

const getPendingTeacherUser = async (id) => {
  const teacher = await Teacher.findById(id).select("userId");
  if (!teacher) throw new ApiError("Teacher not found", 404);

  const user = await User.findById(teacher.userId);
  if (!user || user.role !== "teacher") {
    throw new ApiError("Teacher account not found", 404);
  }

  const status = resolvedApprovalStatus(user);
  if (status === "approved") {
    throw new ApiError("Teacher is already approved", 400);
  }
  if (status === "rejected") {
    throw new ApiError("Teacher request has already been rejected", 400);
  }

  return user;
};

const createTeacher = async (data) => {
  const { name, phone, password, description, subject } = data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await User.create(
      [
        {
          name,
          phone,
          password: hashedPassword,
          role: "teacher",
          isApproved: true,
          approvalStatus: "approved",
        },
      ],
      { session }
    );

    const [teacher] = await Teacher.create(
      [
        {
          userId: user._id,
          ...(description && { description }),
          ...(subject && { subject }),
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return await Teacher.findById(teacher._id).populate("userId", "-password");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const getTeachers = async () => {
  // This endpoint is admin-only, so its list must include inactive profiles as
  // well. Deactivated accounts remain hidden from all protected routes.
  return await Teacher.find({}).populate("userId", "-password");
};

const getTeacherById = async (id, currentUser) => {
  const teacher = await Teacher.findById(id).populate("userId", "-password");
  const profileUserId = teacher?.userId?._id || teacher?.userId;

  if (
    teacher &&
    currentUser?.role === "teacher" &&
    (!profileUserId ||
      profileUserId.toString() !== (currentUser._id || currentUser.id).toString())
  ) {
    throw new ApiError("You are not authorized to view this teacher profile", 403);
  }

  return teacher;
};

const getTeacherByUserId = async (userId) => {
  return await Teacher.findOne({ userId }).populate("userId", "-password");
};

const updateTeacher = async (id, data, currentUser) => {
  const teacher = await Teacher.findById(id);
  if (!teacher) throw new ApiError("Teacher not found", 404);

  // السماح للأدمن، أو للمدرس نفسه فقط بتعديل بروفايله
  if (currentUser.role === "teacher" && teacher.userId.toString() !== (currentUser._id || currentUser.id).toString()) {
    throw new ApiError("Not authorized to update this profile", 403);
  }

  const filteredData = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
  }

  return await Teacher.findByIdAndUpdate(id, filteredData, { new: true, runValidators: true }).populate("userId", "-password");
};

const deleteTeacher = async (id) => {
  // Deleting a teacher from the admin dashboard is a soft delete. Keeping the
  // profile and its group relationships intact avoids orphaning related data.
  return deactivateTeacher(id);
};

const activateTeacher = async (id) => {
  const teacher = await Teacher.findByIdAndUpdate(id, { isActive: true }, { new: true }).populate("userId", "-password");
  if (teacher?.userId) {
    await User.findByIdAndUpdate(teacher.userId, { isActive: true });
  }
  return teacher;
};

const deactivateTeacher = async (id) => {
  const teacher = await Teacher.findByIdAndUpdate(id, { isActive: false }, { new: true }).populate("userId", "-password");
  if (teacher?.userId) {
    await User.findByIdAndUpdate(teacher.userId, { isActive: false });
  }
  return teacher;
};

const approveTeacher = async (id, reviewer) => {
  const user = await getPendingTeacherUser(id);

  return await User.findByIdAndUpdate(
    user._id,
    {
      isApproved: true,
      approvalStatus: "approved",
      approvalReviewedAt: new Date(),
      approvalReviewedBy: reviewer?._id || reviewer?.id || null,
    },
    { new: true }
  ).select("-password");
};

const rejectTeacher = async (id, reviewer) => {
  const user = await getPendingTeacherUser(id);

  return await User.findByIdAndUpdate(
    user._id,
    {
      isApproved: false,
      approvalStatus: "rejected",
      approvalReviewedAt: new Date(),
      approvalReviewedBy: reviewer?._id || reviewer?.id || null,
    },
    { new: true }
  ).select("-password");
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  getTeacherByUserId,
  updateTeacher,
  deleteTeacher,
  activateTeacher,
  deactivateTeacher,
  approveTeacher,
  rejectTeacher,
};
