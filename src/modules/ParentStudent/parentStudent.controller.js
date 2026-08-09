const parentStudentService = require("../ParentStudent/parentStudent.service");

// Create Parent-Student relation
const createParentStudent = async (req, res) => {
  try {
    const newParentStudent =
      await parentStudentService.createParentStudent(req.body);

    res.status(201).json({
      message: "Parent linked to student successfully",
      parentStudent: newParentStudent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get all relations
const getAllParentStudents = async (req, res) => {
  try {
    const parentStudents =
      await parentStudentService.getAllParentStudents();

    res.status(200).json({
      parentStudents,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get relation by ID
const getOneParentStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const parentStudent =
      await parentStudentService.getOneParentStudent(id);

    if (!parentStudent) {
      return res.status(404).json({
        message: "Parent-student relation not found",
      });
    }

    res.status(200).json({
      parentStudent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get all students of a parent
const getParentStudents = async (req, res) => {
  try {
    const { parentId } = req.params;

    const students =
      await parentStudentService.getParentStudents(parentId);

    res.status(200).json({
      students,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get all parents of a student
const getStudentParents = async (req, res) => {
  try {
    const { studentId } = req.params;

    const parents =
      await parentStudentService.getStudentParents(studentId);

    res.status(200).json({
      parents,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete relation
const deleteParentStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedParentStudent =
      await parentStudentService.deleteParentStudent(id);

    if (!deletedParentStudent) {
      return res.status(404).json({
        message: "Parent-student relation not found",
      });
    }

    res.status(200).json({
      message: "Student unlinked from parent successfully",
      parentStudent: deletedParentStudent,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const linkChildByCode = async (req, res) => {
  try {
    const { studentCode } = req.body;

    const parentStudent = await parentStudentService.linkChildByCode(
      req.user._id,
      studentCode
    );

    res.status(201).json({
      message: "Child linked successfully",
      parentStudent,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
};

const getMyChildren = async (req, res) => {
  try {
    const students = await parentStudentService.getMyChildren(req.user._id);

    res.status(200).json({
      students,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createParentStudent,
  getAllParentStudents,
  getOneParentStudent,
  getParentStudents,
  getStudentParents,
  deleteParentStudent,
  linkChildByCode,
  getMyChildren,
};