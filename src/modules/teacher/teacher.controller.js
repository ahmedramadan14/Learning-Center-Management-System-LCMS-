const teacherService = require("./teacher.service");
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/ApiErrors');


// @desc    Create a teacher (with a full login account)
// @route   POST /api/v1/teachers
// @access  Private/Admin
const createTeacher = asyncHandler(async (req, res) => {
    const teacher = await teacherService.createTeacher(req.body);

    res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: teacher
    });
});

const getTeachers = asyncHandler(async (req, res) => {
    const teachers = await teacherService.getTeachers();
    res.status(200).json({
        success: true,
        data: {
            count: teachers.length,
            teachers
        }
    });
});

const getTeacherById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const teacher = await teacherService.getTeacherById(id);

    if (!teacher) throw new ApiError('teacher not found', 404);

    res.status(200).json({
        success: true,
        data: { teacher }
    });
});


// @desc    Update teacher's own profile (description/subject only)
// @route   PUT /api/v1/teachers/:id
// @access  Private/Admin
const updateTeacher = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const teacher = await teacherService.getTeacherById(id);
    if (!teacher) throw new ApiError('teacher not found', 404);

    const updatedTeacher = await teacherService.updateTeacher(id, data);
    res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: updatedTeacher
    });
});

const deleteTeacher = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const teacher = await teacherService.getTeacherById(id);
    if (!teacher) throw new ApiError('teacher not found', 404);

    const deletedTeacher = await teacherService.deleteTeacher(id);
    res.status(200).json({
        success: true,
        message: "Teacher Deleted successfully",
        data: deletedTeacher
    });
});


const activateTeacher = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const teacher = await teacherService.getTeacherById(id);
    if (!teacher) throw new ApiError('teacher not found', 404);

    const activatedTeacher = await teacherService.activateTeacher(id);
    res.status(200).json({
        success: true,
        message: "Teacher Active successfully",
        data: activatedTeacher
    });
});

const deactivateTeacher = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const teacher = await teacherService.getTeacherById(id);
    if (!teacher) throw new ApiError('teacher not found', 404);

    const deactivatedTeacher = await teacherService.deactivateTeacher(id);
    res.status(200).json({
        success: true,
        message: "Teacher Deactivate successfully",
        data: deactivatedTeacher
    });
});

// @desc    Approve teacher account (grants access to protected teacher features)
// @route   PATCH /api/v1/teachers/:id/approve
// @access  Private/Admin
const approveTeacher = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const teacher = await teacherService.getTeacherById(id);
    if (!teacher) throw new ApiError('teacher not found', 404);

    const approvedUser = await teacherService.approveTeacher(id);
    res.status(200).json({
        success: true,
        message: "Teacher approved successfully",
        data: approvedUser
    });
});


module.exports = {
    createTeacher,
    getTeachers,
    updateTeacher,
    deleteTeacher,
    getTeacherById,
    activateTeacher,
    deactivateTeacher,
    approveTeacher,
};