const attendanceservice = require('./attendance.service.js')
const createattendance = async (req, res, next) => {


    try {
        const attend = await attendanceservice.createattendance(req.body)
        return res.status(200).json({ message: "Attendance Created", attend })
    }

    catch (err) {
        return res.status(404).json("error");
    }
}

const updateattendance = async (req, res, next) => {
    try {
        const { studentId } = req.params;
        const updated = req.body
        const update = await attendanceservice.updateattendance(studentId, updated)
        return res.status(200).json({ message: "Attendance Updated", update })
    }

    catch (error) {


        return res.status(500).json("error");
    }
}

const getallattendance = async (req, res, next) => {

    try {
        const allattend = await attendanceservice.getallattendance();
        return res.status(200).json({ message: "all Attendance", allattend })
    }

    catch (err) {
        return res.status(404).json("error");
    }
}

const getattendancebyid = async (req, res, next) => {

    try {
        const { studentId } = req.params
        const attendbyid = await attendanceservice.getbyidattendance(studentId);
        return res.status(200).json({ message: "Attendance", attendbyid })
    }

    catch (err) {
        // console.log(err);

        return res.status(404).json("error");
    }

}

const deleteAttendance = async (req, res, next) => {
    try {
        const { studentId } = req.params
        const deleted = await attendanceservice.deleteattendance(studentId);

        if (!deleted) {
            return res.status(404).json({ message: "Attendance not found" });
        }

        return res.status(200).json({
            message: "Attendance Deleted Successfully",
            deleted
        });
    } catch (err) {
        return res.status(500).json("error");
    }
}

module.exports = { createattendance, updateattendance, getallattendance, getattendancebyid, deleteAttendance }