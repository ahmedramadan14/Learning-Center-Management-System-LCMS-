const Course = require("./course.model");
const ApiError = require("../../utils/ApiErrors");

exports.createCourse = (data) => Course.create(data);

exports.getCourses = () => Course.find().sort({ createdAt: -1 });

exports.getCourse = async (id) => {
  const course = await Course.findById(id);
  if (!course) throw new ApiError("Course not found", 404);
  return course;
};

exports.updateCourse = async (id, data) => {
  const course = await Course.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!course) throw new ApiError("Course not found", 404);
  return course;
};

exports.deleteCourse = async (id) => {
  const course = await Course.findByIdAndDelete(id);
  if (!course) throw new ApiError("Course not found", 404);
  return course;
};
