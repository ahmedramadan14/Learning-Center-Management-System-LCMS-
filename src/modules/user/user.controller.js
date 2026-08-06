const userService = require("./user.service");
const asyncHandler = require("../../middlewares/asyncHandler");
const ApiError = require("../../utils/ApiErrors");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

// CREATE
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

// GET ALL
const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.status(200).json({
    success: true,
    data: {
      count: users.length,
      users,
    },
  });
});

// GET ONE
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) return next(new ApiError("User not found", 404));
  res.status(200).json({
    success: true,
    data: user,
  });
});

// GET BY ROLE
const getUsersByRole = asyncHandler(async (req, res) => {
  const users = await userService.getUsersByRole(req.params.role);
  res.status(200).json({
    success: true,
    data: {
      count: users.length,
      users,
    },
  });
});

// UPDATE
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await userService.updateUser(req.params.id, req.body);
  if (!user) return next(new ApiError("User not found", 404));
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// DELETE
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// ASSIGN ROLE
const assignRole = asyncHandler(async (req, res, next) => {
  const user = await userService.assignRole(req.params.id, req.body.role);
  if (!user) return next(new ApiError("User not found", 404));
  res.status(200).json({
    success: true,
    message: "Role assigned successfully",
    data: user,
  });
});

// ACTIVATE
const activateUser = asyncHandler(async (req, res, next) => {
  const user = await userService.activateUser(req.params.id);
  if (!user) return next(new ApiError("User not found", 404));
  res.status(200).json({
    success: true,
    message: "User activated successfully",
    data: user,
  });
});

// DEACTIVATE
const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await userService.deactivateUser(req.params.id);
  if (!user) return next(new ApiError("User not found", 404));
  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
    data: user,
  });
});

// --------------------------------------------

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id || req.user._id;
  next();
});

// @desc    Update Logged user Password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const user = await User.findByIdAndUpdate(
    req.user.id || req.user._id,
    {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    },
    { new: true }
  );

  if (!user) return next(new ApiError("User not found", 404));

  const token = generateToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;
  res.status(200).json({ data: userObj, token });
});

// @desc    Update Logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updateData = {};
  if (req.body.name || req.body.username) updateData.name = req.body.name || req.body.username;
  if (req.body.email) updateData.email = req.body.email;
  if (req.body.phone) updateData.phone = req.body.phone;

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id || req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedUser) return next(new ApiError("User not found", 404));

  const userObj = updatedUser.toObject();
  delete userObj.password;
  res.status(200).json({ data: userObj });
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUsersByRole,
  updateUser,
  deleteUser,
  assignRole,
  activateUser,
  deactivateUser,

  // logged user data
  getLoggedUserData,
  updateLoggedUserData,
  updateLoggedUserPassword,
};