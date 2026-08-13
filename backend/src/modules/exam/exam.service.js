const Exam = require("./exam.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const Secretary = require("../secretaries/secretary.model"); 
const ApiError = require("../../utils/ApiErrors");

const getStaffAssociatedTeacherId = async (user) => {
    if (user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id || user.id });
        if (!teacher) throw new ApiError("Teacher profile not found", 404);
        return teacher._id;
    } else if (user.role === "secretary") {
        const secretary = await Secretary.findOne({ $or: [{ userId: user._id || user.id }, { user: user._id || user.id }] });
        if (!secretary || !secretary.teacher) {
            throw new ApiError("Secretary is not linked to any valid teacher", 400);
        }
        return secretary.teacher;
    }
    return null;
};

const verifyExamOwnership = async (examId, user) => {
    const exam = await Exam.findById(examId);
    if (!exam) throw new ApiError("Exam not found", 404);

    if (user.role === "admin") return exam;

    const associatedTeacherId = await getStaffAssociatedTeacherId(user);
    
    if (!associatedTeacherId || exam.teacher.toString() !== associatedTeacherId.toString()) {
        throw new ApiError("You are not authorized to access this exam", 403);
    }
    
    return exam;
};

exports.createExam = async (data, user) => {
    const group = await Group.findById(data.group);
    if (!group) throw new ApiError("Group not found", 404);

    const teacherId = await getStaffAssociatedTeacherId(user);

    if (group.teacherId.toString() !== teacherId.toString()) {
        throw new ApiError("You cannot create an exam for a group that does not belong to you", 403);
    }

    if (data.passingMarks > data.totalMarks) {
        throw new ApiError("Passing marks cannot exceed total marks", 400);
    }

    return await Exam.create({ ...data, teacher: teacherId });
};

exports.getAllExams = async (user) => {
    let filter = {};

    if (user.role === "teacher" || user.role === "secretary") {
        const teacherId = await getStaffAssociatedTeacherId(user);
        if (!teacherId) return [];
        filter = { teacher: teacherId };
    } 
    else if (user.role === "student") {
        const student = await Student.findOne({ userId: user._id || user.id });
        if (!student || !student.groups || student.groups.length === 0) return [];
        filter = { 
            group: { $in: student.groups },
            status: "published"
        };
    } 
    else if (user.role === "parent") {
        const parent = await Parent.findOne({ user: user._id || user.id });
        if (!parent || !parent.students || parent.students.length === 0) return [];

        const students = await Student.find({ _id: { $in: parent.students } }).select("groups");
        const allGroupIds = students.flatMap(s => s.groups || []);
        const uniqueGroupIds = [...new Set(allGroupIds.map(g => g.toString()))];

        if (uniqueGroupIds.length === 0) return [];

        filter = {
            group: { $in: uniqueGroupIds },
            status: "published"
        };
    }

    return await Exam.find(filter)
        .populate("group", "groupName")
        .populate("teacher", "userId")
        .sort({ examDate: -1 });
};

exports.getExamById = async (id, user) => {
    const exam = await Exam.findById(id).populate("group", "groupName");
    if (!exam) throw new ApiError("Exam not found", 404);

    if (user.role === "student" || user.role === "parent") {
        if (exam.status !== "published") {
            throw new ApiError("Exam not found", 404);
        }
    }

    return exam;
};

exports.updateExam = async (id, updateData, user) => {
    const exam = await verifyExamOwnership(id, user);

    const totalMarks = updateData.totalMarks || exam.totalMarks;
    const passingMarks = updateData.passingMarks !== undefined ? updateData.passingMarks : exam.passingMarks;

    if (passingMarks > totalMarks) {
        throw new ApiError("Passing marks cannot exceed total marks", 400);
    }

    return await Exam.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

exports.deleteExam = async (id, user) => {
    await verifyExamOwnership(id, user);
    return await Exam.findByIdAndDelete(id);
};

exports.publishExam = async (id, user) => {
    await verifyExamOwnership(id, user);
    return await Exam.findByIdAndUpdate(id, { status: "published" }, { new: true });
};
