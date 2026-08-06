const Grade = require("./grade.model");
const ApiError = require("../../utils/ApiErrors");

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
exports.getAllGrades = async () => {
  const grades = await Grade.find();

  return grades;
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

  // التأكد إن الاسم الجديد مش موجود
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

  await Grade.findByIdAndDelete(id);

  return;
};