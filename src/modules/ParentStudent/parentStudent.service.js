const ParentStudent = require("../ParentStudent/parentStudent.model");
const Parent = require("../parent/parent.model");
const Student = require("../student/student.model");
const ApiError = require("../../utils/ApiErrors");

// Create Parent-Student relation
const createParentStudent = async (data) => {
  const [parentExists, studentExists] = await Promise.all([
    Parent.exists({ _id: data.parent }),
    Student.exists({ _id: data.student }),
  ]);

  if (!parentExists) throw new ApiError("Parent not found", 404);
  if (!studentExists) throw new ApiError("Student not found", 404);

  const newParentStudent = await ParentStudent.create(data);
  return newParentStudent;
};

// Get all relations
const getAllParentStudents = async () => {
  const parentStudents = await ParentStudent.find()
    .populate("parent")
    .populate("student");

  return parentStudents;
};

// Get relation by ID
const getOneParentStudent = async (id) => {
  const parentStudent = await ParentStudent.findById(id)
    .populate("parent")
    .populate("student");

  return parentStudent;
};

// Get all students of a parent
const getParentStudents = async (parentId) => {
  const parentStudents = await ParentStudent.find({
    parent: parentId,
  }).populate("student");

  return parentStudents;
};

// Get all parents of a student
const getStudentParents = async (studentId) => {
  const parentStudents = await ParentStudent.find({
    student: studentId,
  }).populate("parent");

  return parentStudents;
};

// Delete relation
const deleteParentStudent = async (id) => {
  const deletedParentStudent = await ParentStudent.findByIdAndDelete(id);

  return deletedParentStudent;
};

// Link a child to the logged-in parent using studentCode
const linkChildByCode = async (userId, studentCode) => {
  const parent = await Parent.findOne({ user: userId });
  if (!parent) throw new ApiError("Parent profile not found", 404);

  const student = await Student.findOne({ studentCode });
  if (!student) throw new ApiError("No student found with this code", 404);

  const alreadyLinked = await ParentStudent.findOne({
    parent: parent._id,
    student: student._id,
  });
  if (alreadyLinked) throw new ApiError("This student is already linked to your account", 400);

  const newParentStudent = await ParentStudent.create({
    parent: parent._id,
    student: student._id,
  });

  return newParentStudent;
};

// Get all children of the logged-in parent (from token, no input needed)
const getMyChildren = async (userId) => {
  const parent = await Parent.findOne({ user: userId });
  if (!parent) throw new ApiError("Parent profile not found", 404);

  const parentStudents = await ParentStudent.find({
    parent: parent._id,
  }).populate("student");

  return parentStudents;
};
module.exports = {
  createParentStudent,
  getAllParentStudents,
  getOneParentStudent,
  getParentStudents,
  getStudentParents,
  deleteParentStudent,
  linkChildByCode,
  getMyChildren,
};