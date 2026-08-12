const asyncHandler = require("../../middlewares/asyncHandler");
const courseService = require("./course.service");

exports.createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ success: true, message: "Course created successfully", data: course });
});

exports.getCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getCourses();
  res.status(200).json({ success: true, results: courses.length, data: courses });
});

exports.getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourse(req.params.id);
  res.status(200).json({ success: true, data: course });
});

exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.status(200).json({ success: true, message: "Course updated successfully", data: course });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  res.status(200).json({ success: true, message: "Course deleted successfully" });
});
