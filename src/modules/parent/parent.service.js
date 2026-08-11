const Parent = require("./parent.model");
const ParentStudent = require("../parentStudent/parentStudent.model");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiErrors");
const Attendance = require("../attendance/attendance.model");
const Payment = require("../payment/payment.model");
const Result = require("../results/result.model");
const Schedule = require("../schedule/schedule.model");
const mongoose = require("mongoose");

// Create Parent
exports.createParent = async (data) => {
  const userExists = await User.findById(data.user);
  if (!userExists) {
    throw new ApiError("User not found", 404);
  }

  if (userExists.role !== "parent") {
    throw new ApiError("Associated user must have the role 'parent'", 400);
  }

  const parentExists = await Parent.findOne({ user: data.user });
  if (parentExists) {
    throw new ApiError("Parent profile already exists for this user", 400);
  }

  return await Parent.create(data);
};

// Get All Parents
exports.getAllParents = async () => {
  return await Parent.find().populate("user", "name email phone role isActive");
};

// Get Parent By ID
exports.getOneParent = async (id, currentUser) => {
  const parent = await Parent.findById(id).populate("user", "name email phone role isActive");
  if (!parent) {
    throw new ApiError("Parent not found", 404);
  }

  const currentUserId = currentUser._id || currentUser.id;
  if (currentUser.role === "parent" && parent.user._id.toString() !== currentUserId.toString()) {
    throw new ApiError("You are not authorized to view this profile", 403);
  }

  return parent;
};

// Update Parent
exports.updateParent = async (id, data, currentUser) => {
  const parent = await Parent.findById(id);
  if (!parent) {
    throw new ApiError("Parent not found", 404);
  }

  const currentUserId = currentUser._id || currentUser.id;
  if (currentUser.role === "parent" && parent.user.toString() !== currentUserId.toString()) {
    throw new ApiError("You are not authorized to update this profile", 403);
  }

  delete data.user;

  return await Parent.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("user", "name email phone role isActive");
};

// Delete Parent (Transaction)
exports.deleteParent = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletedParent = await Parent.findByIdAndDelete(id, { session });

    if (!deletedParent) {
      throw new ApiError("Parent not found", 404);
    }

    await ParentStudent.deleteMany({ parent: id }, { session });

    await User.findByIdAndDelete(deletedParent.user, { session });

    await session.commitTransaction();
    session.endSession();

    return deletedParent;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

exports.getParentDashboard = async (userId) => {
  const parent = await Parent.findOne({ user: userId });
  if (!parent) throw new ApiError("Parent profile not found", 404);

  const parentStudents = await ParentStudent.find({ parent: parent._id })
    .populate({
      path: "student",
      populate: [
        { path: "userId", select: "name phone email" },
        { path: "groups", select: "groupName" }
      ]
    });

  const childrenData = await Promise.all(
    parentStudents.map(async (ps) => {
      if (!ps.student) return null;

      const studentId = ps.student._id;

      const groupIds = ps.student.groups ? ps.student.groups.map(g => g._id) : [];
      const [attendance, payments, examResults, schedules] = await Promise.all([
        Attendance.find({ studentId: studentId })
          .populate("groupId", "groupName")
          .sort({ date: -1 })
          .limit(10),

        Payment.find({ studentId: studentId })
          .populate("groupId", "groupName")
          .sort({ createdAt: -1 }),

        Result.find({ student: studentId })
          .populate("exam", "title totalMarks")
          .sort({ createdAt: -1 }),

        Schedule.find({ groupId: { $in: groupIds } })
          .populate("groupId", "groupName")
          .sort({ day: 1, startTime: 1 }) 
      ]);
      return {
        student: ps.student,
        attendance,
        payments,
        examResults,
        schedules
      };
    })
  );

  return childrenData.filter(Boolean);
};