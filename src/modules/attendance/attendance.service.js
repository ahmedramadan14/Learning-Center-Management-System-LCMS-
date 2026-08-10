const attendanceModel = require("./attendance.model");
const Student = require("../student/student.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");
const ApiError = require("../../utils/ApiErrors");

const normalizeDate = (date) => {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const createattendance = async (attendData, user) => {
    const student = await Student.findOne({ studentCode: attendData.studentCode, isActive: true });
    if (!student) throw new ApiError("Student not found", 404);

    const group = await Group.findById(attendData.groupId);
    if (!group) throw new ApiError("Group not found", 404);

    if (user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id || user.id });
        if (!teacher || group.teacherId.toString() !== teacher._id.toString()) {
            throw new ApiError("You can only record attendance for your own groups", 403);
        }
    } else if (user.role === "secretary") {
        const teacher = await Teacher.findOne({ userId: user.createdBy });
        if (!teacher || group.teacherId.toString() !== teacher._id.toString()) {
            throw new ApiError("You can only record attendance for groups belonging to your teacher", 403);
        }
    }

    const attendanceDate = normalizeDate(attendData.date);

    const exists = await attendanceModel.findOne({
        studentId: student._id,
        groupId: attendData.groupId,
        date: attendanceDate,
    });
    if (exists) throw new ApiError("Attendance already recorded for this student on this date", 400);

    const attendance = await attendanceModel.create({
        studentId: student._id,
        groupId: attendData.groupId,
        status: attendData.status,
        method: attendData.method || "Manual",
        date: attendanceDate,
    });

    return attendance;
};

const updateattendance = async (id, updated) => {
    delete updated.studentId;
    delete updated.groupId;
    delete updated.date;

    const update = await attendanceModel.findByIdAndUpdate(id, updated, { new: true, runValidators: true });
    return update;
};

const getallattendance = async (user) => {
    let filter = {};

    if (!user) return [];

    if (user.role === "teacher" || user.role === "secretary") {
        let teacherUserId = user.role === "teacher" ? (user._id || user.id) : user.createdBy;
        const teacher = await Teacher.findOne({ userId: teacherUserId });
        if (!teacher) return [];

        const teacherGroups = await Group.find({ teacherId: teacher._id }).select("_id");
        const groupIds = teacherGroups.map((g) => g._id);

        filter = { groupId: { $in: groupIds } };
    } else if (user.role === "student") {
        const student = await Student.findOne({ userId: user._id || user.id });
        if (!student) return [];
        filter = { studentId: student._id };
    } else if (user.role === "parent") {
        const parentLinks = await ParentStudent.find({ parentUserId: user._id || user.id }).select("studentId");
        const studentIds = parentLinks.map((p) => p.studentId);
        filter = { studentId: { $in: studentIds } };
    }

    return await attendanceModel.find(filter)
        .populate({
            path: "studentId",
            select: "studentCode parentPhone",
            populate: { path: "userId", select: "name phone" }
        })
        .populate("groupId", "groupName")
        .sort({ date: -1 });
};

const getbystudentattendance = async (studentCode, user) => {
    const student = await Student.findOne({ studentCode });
    if (!student) throw new ApiError("Student not found", 404);

    if (user.role === "student") {
        const currentStudent = await Student.findOne({ userId: user._id || user.id });
        if (currentStudent?._id.toString() !== student._id.toString()) {
            throw new ApiError("You can only view your own attendance records", 403);
        }
    } else if (user.role === "parent") {
        const isChild = await ParentStudent.exists({ parentUserId: user._id || user.id, studentId: student._id });
        if (!isChild) {
            throw new ApiError("You can only view attendance records for your children", 403);
        }
    }

    return await attendanceModel.find({ studentId: student._id })
        .populate("groupId", "groupName")
        .sort({ date: -1 });
};

const deleteattendance = async (id) => {
    return await attendanceModel.findByIdAndDelete(id);
};

module.exports = { deleteattendance, getbystudentattendance, getallattendance, updateattendance, createattendance };