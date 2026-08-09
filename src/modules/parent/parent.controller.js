const parentService = require("../parent/parent.service");

// Create Parent
const createParent = async (req, res) => {
  try {
    const newParent = await parentService.createParent(req.body);

    res.status(201).json({
      message: "Parent created successfully",
      parent: newParent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Parents
const getAllParents = async (req, res) => {
  try {
    const parents = await parentService.getAllParents();

    res.status(200).json({
      parents,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Parent By ID
const getOneParent = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await parentService.getOneParent(id);

    if (!parent) {
      return res.status(404).json({
        message: "Parent not found",
      });
    }

    res.status(200).json({
      parent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Parent
const updateParent = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedParent = await parentService.updateParent(
      id,
      req.body
    );

    if (!updatedParent) {
      return res.status(404).json({
        message: "Parent not found",
      });
    }

    res.status(200).json({
      message: "Parent updated successfully",
      parent: updatedParent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete Parent
const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedParent = await parentService.deleteParent(id);

    if (!deletedParent) {
      return res.status(404).json({
        message: "Parent not found",
      });
    }

    res.status(200).json({
      message: "Parent deleted successfully",
      parent: deletedParent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createParent,
  getAllParents,
  getOneParent,
  updateParent,
  deleteParent,
};