const ParentStudent = require("./parentStudent.model"); 
const Parent = require("../parent/parent.model");
const Student = require("../student/student.model");
const Group = require("../group/group.model");
const Secretary = require("../secretaries/secretary.model");
const ApiError = require("../../utils/ApiErrors");

const updateStudentParentPhone = async (parentId, studentId) => {
  const parent = await Parent.findById(parentId).populate("user", "phone");
  if (parent && parent.user && parent.user.phone) {
    await Student.findByIdAndUpdate(studentId, { parentPhone: parent.user.phone });
  }
};

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0020")) return `0${digits.slice(4)}`;
  if (digits.startsWith("20") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
};

const getManagedStudentIds = async (currentUser) => {
  if (currentUser.role === "admin") return null;

  if (currentUser.role !== "secretary") {
    throw new ApiError("You are not authorized to manage parent-student links", 403);
  }

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

const assertCanManageStudent = async (studentId, currentUser) => {
  const managedStudentIds = await getManagedStudentIds(currentUser);
  if (managedStudentIds === null) return;

  const canManage = managedStudentIds.some(
    (managedStudentId) => managedStudentId.toString() === studentId.toString()
  );
  if (!canManage) {
    throw new ApiError("You are not authorized to manage this student's parent links", 403);
  }
};

exports.createParentStudent = async (data, currentUser) => {
  const [parent, student] = await Promise.all([
    Parent.findById(data.parent).populate("user", "phone"),
    Student.findById(data.student).select("parentPhone"),
  ]);

  if (!parent) throw new ApiError("Parent not found", 404);
  if (!student) throw new ApiError("Student not found", 404);

  await assertCanManageStudent(data.student, currentUser);

  if (currentUser.role === "secretary") {
    const parentPhone = normalizePhone(parent.user?.phone);
    const studentParentPhone = normalizePhone(student.parentPhone);
    if (!parentPhone || !studentParentPhone || parentPhone !== studentParentPhone) {
      throw new ApiError(
        "The parent account phone number does not match this student's parent phone number",
        403
      );
    }
  }

 const relation = await ParentStudent.create(data);

  await updateStudentParentPhone(data.parent, data.student);

  return relation;
};

exports.getAllParentStudents = async (currentUser) => {
  const managedStudentIds = await getManagedStudentIds(currentUser);
  const filter = managedStudentIds === null ? {} : { student: { $in: managedStudentIds } };

  return await ParentStudent.find(filter)
    .populate({ path: "parent", populate: { path: "user", select: "name phone" } })
    .populate({ path: "student", populate: { path: "userId", select: "name phone" } });
};

exports.getOneParentStudent = async (id, currentUser) => {
  const parentStudent = await ParentStudent.findById(id)
    .populate({ path: "parent", populate: { path: "user", select: "name phone" } })
    .populate({ path: "student", populate: { path: "userId", select: "name phone" } });

  if (!parentStudent) throw new ApiError("Relation not found", 404);
  await assertCanManageStudent(parentStudent.student._id || parentStudent.student, currentUser);
  return parentStudent;
};

exports.getParentStudents = async (parentId, currentUser) => {
  const managedStudentIds = await getManagedStudentIds(currentUser);
  const filter = {
    parent: parentId,
    ...(managedStudentIds !== null && { student: { $in: managedStudentIds } }),
  };

  return await ParentStudent.find(filter)
    .populate({ path: "student", populate: { path: "userId", select: "name phone email" } });
};

exports.getStudentParents = async (studentId, currentUser) => {
  await assertCanManageStudent(studentId, currentUser);

  return await ParentStudent.find({ student: studentId })
    .populate({ path: "parent", populate: { path: "user", select: "name phone email" } });
};

exports.deleteParentStudent = async (id, currentUser) => {
  const relation = await ParentStudent.findById(id);
  if (!relation) throw new ApiError("Relation not found", 404);

  await assertCanManageStudent(relation.student, currentUser);
  await relation.deleteOne();
  return relation;
};

exports.linkChildByCode = async (user, studentCode) => {
  const userId = user._id || user.id || user;
  const parent = await Parent.findOne({ user: userId }).populate("user", "phone");
  if (!parent) throw new ApiError("Parent profile not found", 404);

  const student = await Student.findOne({ studentCode, isActive: true });
  if (!student) throw new ApiError("No active student found with this code", 404);

  const parentPhone = normalizePhone(parent.user?.phone);
  const studentParentPhone = normalizePhone(student.parentPhone);
  if (!parentPhone || !studentParentPhone || parentPhone !== studentParentPhone) {
    throw new ApiError(
      "This student code is not associated with your verified parent phone number",
      403
    );
  }

  const alreadyLinked = await ParentStudent.findOne({
    parent: parent._id,
    student: student._id,
  });
  if (alreadyLinked) throw new ApiError("This student is already linked to your account", 400);

const relation = await ParentStudent.create({
    parent: parent._id,
    student: student._id,
  });

  await updateStudentParentPhone(parent._id, student._id);

  return relation;
};

exports.getMyChildren = async (user) => {
  const userId = user._id || user.id || user;
  const parent = await Parent.findOne({ user: userId });
  if (!parent) throw new ApiError("Parent profile not found", 404);

  return await ParentStudent.find({ parent: parent._id })
    .populate({
      path: "student",
      populate: [
        { path: "userId", select: "name phone email" },
        { path: "grade", select: "name" },
        { path: "groups", select: "groupName" }
      ]
    });
};
