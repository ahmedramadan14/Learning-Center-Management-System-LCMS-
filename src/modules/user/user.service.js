const bcrypt = require("bcryptjs");
const User = require("./user.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const ApiError = require("../../utils/ApiErrors");
 
const ROLE_PROFILE_MODELS = {
  teacher: Teacher,
  student: Student,
  parent: Parent,
};

const PROFILE_MODEL_USER_FIELD = {
  teacher: "userId",
  student: "userId",
  parent: "user",
};


const ALLOWED_ADMIN_UPDATE_FIELDS = ["name", "phone", "email", "profileImage"];


// CREATE
const createUser = async (data) => {
  const { name, phone, email, password, role } = data;
 
  if (ROLE_PROFILE_MODELS[role]) {
    throw new ApiError(
      `Cannot create a user with role "${role}" here. Use the dedicated create endpoint for that role instead.`,
      400
    );
  }
 
  const hashedPassword = await bcrypt.hash(password, 12);
 
  const user = await User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    role,
  });
  return user;
};
 
// READ ALL
const getUsers = async () => {
  return await User.find();
};
 
// READ ONE
const getUserById = async (id) => {
  return await User.findById(id);
};
 
// READ BY ROLE
const getUsersByRole = async (role) => {
  return await User.find({ role });
};

// UPDATE (basic profile fields only — NOT password/role/isActive)
const updateUser = async (id, data) => {
  const filteredData = {};
  for (const key of ALLOWED_ADMIN_UPDATE_FIELDS) {
    if (data[key] !== undefined) {
      filteredData[key] = data[key];
    }
  }
 
  return await User.findByIdAndUpdate(id, filteredData, { new: true, runValidators: true });
};
 
// DELETE (cascades to whichever role-profile document this user owns)
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (user) {
    const ProfileModel = ROLE_PROFILE_MODELS[user.role];
    if (ProfileModel) {
      const field = PROFILE_MODEL_USER_FIELD[user.role];
      await ProfileModel.findOneAndDelete({ [field]: user._id }).catch(() => {});
    }
  }
  return user;
};
 // ASSIGN ROLE (with cascade cleanup for orphaned profile documents)
const assignRole = async (id, newRole) => {
  const user = await User.findById(id);
  if (!user) return null;
 
  const oldRole = user.role;
  if (oldRole === newRole) return user;
 
  if (ROLE_PROFILE_MODELS[newRole]) {
    throw new ApiError(
      `Cannot assign role "${newRole}" directly. Use the dedicated create endpoint for that role instead.`,
      400
    );
  }
 
  user.role = newRole;
  await user.save();
 
  const OldProfileModel = ROLE_PROFILE_MODELS[oldRole];
  if (OldProfileModel) {
    const field = PROFILE_MODEL_USER_FIELD[oldRole];
    await OldProfileModel.findOneAndDelete({ [field]: id });
  }
 
  return user;
};
 

// ACTIVATE
const activateUser = async (id) => {
  return await User.findByIdAndUpdate(id, { isActive: true }, { new: true });
};
 

// DEACTIVATE
const deactivateUser = async (id) => {
  return await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
 
module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRole,
  activateUser,
  deactivateUser,
  getUsersByRole,
};