const Parent = require("../modules/parent/parent.model");
const ParentStudent = require("../modules/parentStudent/parentStudent.model");
const ApiError = require("../utils/ApiErrors");
const asyncHandler = require("./asyncHandler");

exports.verifyChildBelongsToParent = asyncHandler(async (req, res, next) => {
  if (["admin", "secretary"].includes(req.user.role)) {
    return next();
  }

  const studentId = req.params.studentId || req.body.studentId;
  if (!studentId) {
    return next(new ApiError("Student ID is required", 400));
  }

  const userId = req.user._id || req.user.id;
  const parent = await Parent.findOne({ user: userId });
  if (!parent) {
    return next(new ApiError("Parent profile not found", 404));
  }

  const isChildLinked = await ParentStudent.findOne({
    parent: parent._id,
    student: studentId,
  });

  if (!isChildLinked) {
    return next(new ApiError("You are not authorized to view data for this student", 403));
  }

  next();
});