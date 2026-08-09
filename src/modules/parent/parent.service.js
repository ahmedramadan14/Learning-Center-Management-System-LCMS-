const Parent = require("../parent/parent.model");
const ParentStudent = require("../parentStudent/parentStudent.model");
const User = require("../user/user.model");
const mongoose = require("mongoose");

// Create Parent
const createParent = async (data) => {
  const newParent = await Parent.create(data);
  return newParent;
};

// Get All Parents
const getAllParents = async () => {
  const parents = await Parent.find().populate("user");
  return parents;
};

// Get Parent By ID
const getOneParent = async (id) => {
  const parent = await Parent.findById(id).populate("user");
  return parent;
};

// Update Parent
const updateParent = async (id, data) => {
  const { user, ...safeData } = data;

  const updatedParent = await Parent.findByIdAndUpdate(
    id,
    safeData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("user");

  return updatedParent;
};

// Delete Parent (with cascade cleanup)
const deleteParent = async (id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deletedParent = await Parent.findByIdAndDelete(id, { session });

    if (!deletedParent) {
      await session.abortTransaction();
      session.endSession();
      return null;
    }

    await ParentStudent.deleteMany({ parent: id }, { session });

    await User.findByIdAndUpdate(
      deletedParent.user,
      { isActive: false },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return deletedParent;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

module.exports = {
  createParent,
  getAllParents,
  getOneParent,
  updateParent,
  deleteParent,
};