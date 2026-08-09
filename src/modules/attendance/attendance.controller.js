const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/ApiErrors');
const attendanceservice = require('./attendance.service.js');

const createattendance = asyncHandler(async (req, res) => {
    const attend = await attendanceservice.createattendance(req.body, req.user);
    res.status(201).json({ success: true, message: "Attendance Created", data: attend });
});

const updateattendance = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const update = await attendanceservice.updateattendance(id, req.body);
    if (!update) return next(new ApiError("Attendance record not found", 404));
    res.status(200).json({ success: true, message: "Attendance Updated", data: update });
});

const getallattendance = asyncHandler(async (req, res) => {
    const allattend = await attendanceservice.getallattendance(req.user);
    res.status(200).json({ success: true, results: allattend.length, data: allattend });
});

const getattendancebyid = asyncHandler(async (req, res) => {
    const { studentCode } = req.params;
    const attendbyid = await attendanceservice.getbystudentattendance(studentCode, req.user);
    res.status(200).json({ success: true, data: attendbyid });
});

const deleteAttendance = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await attendanceservice.deleteattendance(id);
    if (!deleted) return next(new ApiError("Attendance not found", 404));
    res.status(200).json({ success: true, message: "Attendance Deleted Successfully" });
});

module.exports = { createattendance, updateattendance, getallattendance, getattendancebyid, deleteAttendance };