const Grade = require("./grade.model");
const ApiError = require("../../utils/ApiErrors");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model");
const Student = require("../student/student.model");

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
  let filter = {};

  if (!user) return [];

  if (user.role === "admin") {
    return await Grade.find({});
  }

  if (user.role === "teacher" || user.role === "secretary") {
    let teacher = null;

    if (user.role === "teacher") {
      teacher = await Teacher.findOne({ userId: user._id || user.id });
    } else if (user.role === "secretary") {
      const secretary = await Secretary.findOne({ userId: user._id || user.id });
      if (secretary && secretary.teacher) {
        teacher = await Teacher.findById(secretary.teacher);
      } else if (user.createdBy) {
        teacher = await Teacher.findOne({ userId: user.createdBy });
      }
    }

    return await Grade.find({});
  } else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return [];
    filter = { _id: student.grade };
  }

  return await Grade.find(filter);
};

// Get Grade By Id
exports.getGradeById = async (id) => {
  const grade = await Grade.findById(id);
  if (!grade) {
    throw new ApiError("Grade not found", 404);
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