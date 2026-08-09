const Grade = require("./grade.model");
const ApiError = require("../../utils/ApiErrors");
const Group = require("../group/group.model");
const Teacher = require('../teacher/teacher.model');
const Student = require('../student/student.model');

// Create Grade
exports.createGrade = async (data) => {
  const gradeExists = await Grade.findOne({ name: data.name });

  if (gradeExists) {
    throw new ApiError("Grade already exists", 400);
  }

  const grade = await Grade.create(data);

  return grade;
};

// Get All Grades
exports.getAllGrades = async (user) => {
  let filter = {};

  if (!user) {
    return await Grade.find(filter);
  }

  if (user.role === "teacher" || user.role === "secretary") {
    let teacherUserId = user.role === "teacher" ? (user._id || user.id) : user.createdBy;
    const teacher = await Teacher.findOne({ userId: teacherUserId });
    
    if (!teacher) return [];

    const teacherGroups = await Group.find({ teacherId: teacher._id }).select("gradeLevelId");
    const gradeIds = teacherGroups.map(g => g.gradeLevelId);

    filter = { _id: { $in: gradeIds } };
  } 
  else if (user.role === "student") {
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

// Update Grade
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
      throw new ApiError("Grade already exists", 400);
    }
  }

  const updatedGrade = await Grade.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedGrade;
};

// Delete Grade
exports.deleteGrade = async (id) => {
  const grade = await Grade.findById(id);

  if (!grade) {
    throw new ApiError("Grade not found", 404);
  }

  const groupsUsingGrade = await Group.exists({ gradeLevelId: id });
  if (groupsUsingGrade) {
    throw new ApiError(
      "Cannot delete grade: it is still used by one or more groups",
      400
    );
  }

  await Grade.findByIdAndDelete(id);

  return;
};