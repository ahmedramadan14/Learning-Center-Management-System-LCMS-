const asyncHandler = require("../../middlewares/asyncHandler");
const parentService = require("./parent.service");

exports.createParent = asyncHandler(async (req, res) => {
  const newParent = await parentService.createParent(req.body, req.user);
  res.status(201).json({
    success: true,
    message: "Parent created successfully",
    data: newParent,
  });
});

exports.getAllParents = asyncHandler(async (req, res) => {
  const parents = await parentService.getAllParents(req.user);
  res.status(200).json({
    success: true,
    results: parents.length,
    data: parents,
  });
});

exports.getOneParent = asyncHandler(async (req, res) => {
  const parent = await parentService.getOneParent(req.params.id, req.user);
  res.status(200).json({
    success: true,
    data: parent,
  });
});

exports.updateParent = asyncHandler(async (req, res) => {
  const updatedParent = await parentService.updateParent(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    message: "Parent updated successfully",
    data: updatedParent,
  });
});

exports.deleteParent = asyncHandler(async (req, res) => {
  await parentService.deleteParent(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: "Parent deleted successfully",
  });
});

exports.getParentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const dashboardData = await parentService.getParentDashboard(userId);

  res.status(200).json({
    success: true,
    results: dashboardData.length,
    data: dashboardData,
  });
});
