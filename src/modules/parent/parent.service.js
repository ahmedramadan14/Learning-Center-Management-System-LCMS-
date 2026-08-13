const Parent = require("./parent.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiErrors");
const Attendance = require("../attendance/attendance.model");
const Payment = require("../payment/payment.model");
const Result = require("../results/result.model");
const Schedule = require("../schedule/schedule.model");
const Group = require("../group/group.model");
const Secretary = require("../secretaries/secretary.model");
const Student = require("../student/student.model");
const Exam = require("../exam/exam.model");
const mongoose = require("mongoose");

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0020")) return `0${digits.slice(4)}`;
  if (digits.startsWith("20") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
};

const getSecretaryManagedStudentIds = async (currentUser) => {
  const secretary = await Secretary.findOne({
    userId: currentUser._id || currentUser.id,
  }).select("teacher");
  if (!secretary?.teacher) {
    throw new ApiError("Secretary is not linked to a teacher", 403);
  }

  const groups = await Group.find({ teacherId: secretary.teacher }).select("_id");
  const groupIds = groups.map((group) => group._id);
  const students = await Student.find({
    $or: [
      { teacher: secretary.teacher },
      { groups: { $in: groupIds } },
    ],
  }).select("_id");

  return students.map((student) => student._id);
};

const assertParentAccess = async (parentId, currentUser) => {
  if (currentUser.role === "admin") return;
  if (currentUser.role !== "secretary") return;

  const studentIds = await getSecretaryManagedStudentIds(currentUser);
  const hasManagedChild = await ParentStudent.exists({
    parent: parentId,
    student: { $in: studentIds },
  });

  if (!hasManagedChild) {
    throw new ApiError("You are not authorized to access this parent", 403);
  }
};

// Create Parent
exports.createParent = async (data, currentUser) => {
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

  if (currentUser?.role === "secretary") {
    const studentIds = await getSecretaryManagedStudentIds(currentUser);
    const students = await Student.find({ _id: { $in: studentIds } }).select("parentPhone");
    const parentPhone = normalizePhone(userExists.phone);
    const matchesManagedStudent = students.some(
      (student) => normalizePhone(student.parentPhone) === parentPhone
    );

    if (!matchesManagedStudent) {
      throw new ApiError(
        "A secretary can only create a parent profile for a parent phone linked to their assigned students",
        403
      );
    }
  }

  return await Parent.create(data);
};

// Get All Parents
exports.getAllParents = async (currentUser) => {
  if (currentUser.role === "admin") {
    return Parent.find().populate("user", "name email phone role isActive");
  }

  const studentIds = await getSecretaryManagedStudentIds(currentUser);
  const parentIds = await ParentStudent.distinct("parent", {
    student: { $in: studentIds },
  });

  return Parent.find({ _id: { $in: parentIds } }).populate(
    "user",
    "name email phone role isActive"
  );
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

  await assertParentAccess(parent._id, currentUser);

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

  await assertParentAccess(parent._id, currentUser);

  delete data.user;

  return await Parent.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("user", "name email phone role isActive");
};

// Delete Parent (Transaction)
exports.deleteParent = async (id, currentUser) => {
  await assertParentAccess(id, currentUser);

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
      const publishedExamIds = await Exam.find({ status: "published" }).distinct("_id");
      const [attendance, payments, examResults, schedules] = await Promise.all([
        Attendance.find({ studentId: studentId })
          .populate("groupId", "groupName")
          .sort({ date: -1 })
          .limit(10),

        Payment.find({ studentId: studentId })
          .populate("groupId", "groupName")
          .sort({ createdAt: -1 }),

        Result.find({ student: studentId, exam: { $in: publishedExamIds } })
          .populate("exam", "title totalMarks")
          .sort({ createdAt: -1 }),

        Schedule.find({ groupId: { $in: groupIds }, isActive: true })
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
