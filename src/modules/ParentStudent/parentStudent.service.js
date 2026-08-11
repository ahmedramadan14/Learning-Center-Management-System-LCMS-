const ParentStudent = require("./parentStudent.model"); // 🌟 إصلاح اسم الملف (Lower CamelCase)
const Parent = require("../parent/parent.model");
const Student = require("../student/student.model");
const ApiError = require("../../utils/ApiErrors");

const updateStudentParentPhone = async (parentId, studentId) => {
  const parent = await Parent.findById(parentId).populate("user", "phone");
  if (parent && parent.user && parent.user.phone) {
    await Student.findByIdAndUpdate(studentId, { parentPhone: parent.user.phone });
  }
};

exports.createParentStudent = async (data) => {
  const [parentExists, studentExists] = await Promise.all([
    Parent.exists({ _id: data.parent }),
    Student.exists({ _id: data.student }),
  ]);

  if (!parentExists) throw new ApiError("Parent not found", 404);
  if (!studentExists) throw new ApiError("Student not found", 404);

 const relation = await ParentStudent.create(data);

  await updateStudentParentPhone(data.parent, data.student);

  return relation;
};

exports.getAllParentStudents = async () => {
  return await ParentStudent.find()
    .populate({ path: "parent", populate: { path: "user", select: "name phone" } })
    .populate({ path: "student", populate: { path: "userId", select: "name phone" } });
};

exports.getOneParentStudent = async (id) => {
  const parentStudent = await ParentStudent.findById(id)
    .populate({ path: "parent", populate: { path: "user", select: "name phone" } })
    .populate({ path: "student", populate: { path: "userId", select: "name phone" } });

  if (!parentStudent) throw new ApiError("Relation not found", 404);
  return parentStudent;
};

exports.getParentStudents = async (parentId) => {
  return await ParentStudent.find({ parent: parentId })
    .populate({ path: "student", populate: { path: "userId", select: "name phone email" } });
};

exports.getStudentParents = async (studentId) => {
  return await ParentStudent.find({ student: studentId })
    .populate({ path: "parent", populate: { path: "user", select: "name phone email" } });
};

exports.deleteParentStudent = async (id) => {
  const deletedRelation = await ParentStudent.findByIdAndDelete(id);
  if (!deletedRelation) throw new ApiError("Relation not found", 404);
  return deletedRelation;
};

exports.linkChildByCode = async (user, studentCode) => {
  const userId = user._id || user.id || user;
  const parent = await Parent.findOne({ user: userId });
  if (!parent) throw new ApiError("Parent profile not found", 404);

  const student = await Student.findOne({ studentCode, isActive: true });
  if (!student) throw new ApiError("No active student found with this code", 404);

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