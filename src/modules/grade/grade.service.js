const Grade = require("./grade.model");
const ApiError = require("../../utils/ApiErrors");
const Group = require("../group/group.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");
const mongoose = require("mongoose");

const findGradesForStudentRecords = async (students) => {
  const values = students
    .map((student) => student.grade)
    .filter((grade) => typeof grade === "string" && grade.trim());

  if (values.length === 0) return [];

  const uniqueValues = [...new Set(values)];
  const gradeIds = uniqueValues.filter((value) => mongoose.isValidObjectId(value));
  const filters = [{ name: { $in: uniqueValues } }];

  if (gradeIds.length > 0) {
    filters.push({ _id: { $in: gradeIds } });
  }

  return Grade.find({ $or: filters });
};

// Create Grade (Admin or Teacher)
exports.createGrade = async (data) => {
  const gradeExists = await Grade.findOne({ name: data.name });
  if (gradeExists) {
    throw new ApiError("Grade already exists", 400);
  }
  return await Grade.create(data);
};

// Get All Grades
exports.getAllGrades = async (user) => {
  if (!user) return [];

  if (user.role === "admin") {
    return await Grade.find({});
  }

  if (user.role === "teacher" || user.role === "secretary") {
    return await Grade.find({});
  }

  if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    return findGradesForStudentRecords([student]);
  }

  if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id }).select("_id");
    if (!parent) return [];

    const links = await ParentStudent.find({ parent: parent._id }).select("student");
    const studentIds = links.map((link) => link.student);
    if (studentIds.length === 0) return [];

    const students = await Student.find({ _id: { $in: studentIds } }).select("grade");
    return findGradesForStudentRecords(students);
  }

  return [];
};

// Get Grade By Id
exports.getGradeById = async (id, user) => {
  const grade = await Grade.findById(id);
  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  if (user.role === "student" || user.role === "parent") {
    const visibleGrades = await exports.getAllGrades(user);
    const canView = visibleGrades.some((visibleGrade) =>
      visibleGrade._id.toString() === grade._id.toString()
    );

    if (!canView) {
      throw new ApiError("You are not authorized to view this grade", 403);
    }
  }

  return grade;
};

// Update Grade (Admin or Teacher)
exports.updateGrade = async (id, data) => {
  const grade = await Grade.findById(id);
  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  if (data.name) {
    const gradeExists = await Grade.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (gradeExists) {
      throw new ApiError("Grade with this name already exists", 400);
    }
  }

  return await Grade.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

// Delete Grade (Admin or Teacher)
exports.deleteGrade = async (id) => {
  const grade = await Grade.findById(id);
  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  const groupsUsingGrade = await Group.exists({ gradeLevelId: id });
  if (groupsUsingGrade) {
    throw new ApiError(
      "Cannot delete grade: it is currently linked to one or more groups",
      400
    );
  }

  await Grade.findByIdAndDelete(id);
};
