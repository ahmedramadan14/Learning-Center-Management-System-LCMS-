const Parent = require("./parent.model");
const ParentStudent = require("../parentStudent/parentStudent.model");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiErrors");
const Attendance = require("../attendance/attendance.model");
const Payment = require("../payment/payment.model");
const Result = require("../results/result.model");
const Schedule = require("../schedule/schedule.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Create Parent
exports.createParent = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existing = await User.findOne({ phone: data.phone }).session(session);
    if (existing) throw new ApiError("This phone number is already registered", 400);

    const [user] = await User.create([{
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      password: await bcrypt.hash(data.password, 12),
      role: "parent",
      isApproved: true,
      isActive: data.isActive !== false,
    }], { session });
    const [parent] = await Parent.create([{
      user: user._id,
      userId: user._id,
      gender: data.gender,
    }], { session });
    await session.commitTransaction();
    return Parent.findById(parent._id).populate("user", "name email phone role isActive");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

  const userChanges = {};
  ["name", "phone", "email", "isActive"].forEach((key) => {
    if (data[key] !== undefined) userChanges[key] = data[key];
  });
  if (Object.keys(userChanges).length) {
    await User.findByIdAndUpdate(parent.user, userChanges, { runValidators: true });
  }

  return await Parent.findByIdAndUpdate(id, { gender: data.gender }, {
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
