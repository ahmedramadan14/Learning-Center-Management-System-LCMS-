const studentService = require("./student.service");
const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/ApiErrors');


// @desc    Create a student (with a full login account)
// @route   POST /api/v1/students
// @access  Private/Secretary
const createStudent = asyncHandler(async (req, res) => {
    const student = await studentService.createStudent({
        ...req.body,
        createdById: req.user.id || req.user._id, // secretary/teacher who created this student
    });

    const studentData = student ? (student.toObject ? student.toObject() : student) : {};
    if (studentData.userId && studentData.userId.password) {
        delete studentData.userId.password;
    }

    res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: studentData
    });
});


const getStudents = asyncHandler(async (req, res) => {
    const students = await studentService.getStudents();
    res.status(200).json({
        success: true,
        data: { 
            count: students.length,
            students 
        }
    });
});

const getStudentById = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const student = await studentService.getStudentsById(id);

    if (!student) throw new ApiError("Student not found", 404);

    res.status(200).json({
        success: true,
        data: { student }
    });
});


const updateStudent = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const forbiddenFields = ["studentCode", "userId", "createdById", "parentId"];
    const hasForbidden = forbiddenFields.some(f => data[f] !== undefined);
    if (hasForbidden) {
        throw new ApiError(`Cannot update fields: ${forbiddenFields.join(", ")} directly`, 400);
    }

    const student = await studentService.getStudentsById(id);
    if (!student) throw new ApiError("Student not found", 404);

    const updatedStudent = await studentService.updateStudent(id, data);
    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent
    });
});

const deleteStudent = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const student = await studentService.getStudentsById(id);
    if (!student) throw new ApiError("Student not found", 404);

    const deletedStudent = await studentService.deleteStudent(id);
    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
        data: deletedStudent
    });
});


const linkParent = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const parentId = req.body.parentId;

    const student = await studentService.getStudentsById(id);
    if (!student) throw new ApiError("Student not found", 404);

    const updatedStudent = await studentService.linkParent(id, parentId);
    res.status(200).json({
        success: true,
        message: "Parent linked successfully",
        data: updatedStudent
    });
});

const getStudentByCode = asyncHandler(async (req, res) => {
    const studentCode = req.params.studentCode;
    const student = await studentService.getStudentByCode(studentCode);

    if (!student) throw new ApiError("Student not found", 404);

    res.status(200).json({
        success: true,
        data: { student }
    });
});


module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    getStudentByCode,
    updateStudent,
    deleteStudent,
    linkParent,
};