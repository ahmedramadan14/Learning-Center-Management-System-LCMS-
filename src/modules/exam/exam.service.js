const Exam = require("./exam.model");
const Group = require("../group/group.model");
const Teacher = require("../teacher/teacher.model");
const Student = require("../student/student.model");
const Parent = require("../parent/parent.model");
const Secretary = require("../secretaries/secretary.model"); 
const ParentStudent = require("../ParentStudent/parentStudent.model");
const ApiError = require("../../utils/ApiErrors");

const pick = (source, fields) =>
    fields.reduce((result, field) => {
        if (source[field] !== undefined) {
            result[field] = source[field];
        }
        return result;
    }, {});

const EXAM_FIELDS = [
    "title",
    "description",
    "group",
    "totalMarks",
    "passingMarks",
    "examDate",
    "duration",
    "status",
];

const getStaffAssociatedTeacherId = async (user) => {
    if (user.role === "teacher") {
        const teacher = await Teacher.findOne({ userId: user._id || user.id });
        if (!teacher) throw new ApiError("Teacher profile not found", 404);
        return teacher._id;
    } else if (user.role === "secretary") {
        const secretary = await Secretary.findOne({ userId: user._id || user.id });
        if (!secretary || !secretary.teacher) {
            throw new ApiError("Secretary is not linked to any valid teacher", 400);
        }
        return secretary.teacher;
    }
    return null;
};

const getParentChildIds = async (user) => {
    const parent = await Parent.findOne({ user: user._id || user.id }).select("_id");
    if (!parent) return [];

    const relations = await ParentStudent.find({ parent: parent._id }).select("student");
    return relations.map((relation) => relation.student);
};

const getVisibleGroupIds = async (user) => {
    if (user.role === "student") {
        const student = await Student.findOne({ userId: user._id || user.id }).select("groups");
        return student?.groups || [];
    }

    if (user.role === "parent") {
        const studentIds = await getParentChildIds(user);
        if (studentIds.length === 0) return [];

        const students = await Student.find({ _id: { $in: studentIds } }).select("groups");
        const uniqueIds = new Map();

        students.forEach((student) => {
            (student.groups || []).forEach((groupId) => {
                uniqueIds.set(groupId.toString(), groupId);
            });
        });

        return [...uniqueIds.values()];
    }

    return [];
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

    // Admins can create an exam for any existing group. Staff accounts are
    // always bound to the teacher who owns that group.
    const teacherId = user.role === "admin"
        ? group.teacherId
        : await getStaffAssociatedTeacherId(user);

    if (!teacherId || group.teacherId.toString() !== teacherId.toString()) {
        throw new ApiError("You cannot create an exam for a group that does not belong to you", 403);
    }

    if (data.passingMarks > data.totalMarks) {
        throw new ApiError("Passing marks cannot exceed total marks", 400);
    }

    const examData = pick(data, EXAM_FIELDS);
    return await Exam.create({
        ...examData,
        group: group._id,
        teacher: teacherId,
    });
};

exports.getAllExams = async (user) => {
    let filter = {};

    if (user.role === "teacher" || user.role === "secretary") {
        const teacherId = await getStaffAssociatedTeacherId(user);
        if (!teacherId) return [];
        filter = { teacher: teacherId };
    } 
    else if (user.role === "student") {
        const groupIds = await getVisibleGroupIds(user);
        if (groupIds.length === 0) return [];
        filter = { 
            group: { $in: groupIds },
            status: "published"
        };
    } 
    else if (user.role === "parent") {
        const groupIds = await getVisibleGroupIds(user);
        if (groupIds.length === 0) return [];

        filter = {
            group: { $in: groupIds },
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

    if (user.role === "teacher" || user.role === "secretary") {
        await verifyExamOwnership(id, user);
    }

    if (user.role === "student" || user.role === "parent") {
        if (exam.status !== "published") {
            throw new ApiError("Exam not found", 404);
        }

        const visibleGroupIds = await getVisibleGroupIds(user);
        const examGroupId = exam.group?._id || exam.group;
        const canView = examGroupId && visibleGroupIds.some(
            (groupId) => groupId.toString() === examGroupId.toString()
        );

        if (!canView) {
            throw new ApiError("Exam not found", 404);
        }
    }

    return exam;
};

exports.updateExam = async (id, updateData, user) => {
    const exam = await verifyExamOwnership(id, user);
    const nextGroupId = updateData.group || exam.group;
    const targetGroup = await Group.findById(nextGroupId);

    if (!targetGroup) {
        throw new ApiError("Group not found", 404);
    }

    if (user.role !== "admin") {
        const teacherId = await getStaffAssociatedTeacherId(user);
        if (!teacherId || targetGroup.teacherId.toString() !== teacherId.toString()) {
            throw new ApiError("You cannot move an exam to a group that does not belong to you", 403);
        }
    }

    const totalMarks = updateData.totalMarks || exam.totalMarks;
    const passingMarks = updateData.passingMarks !== undefined ? updateData.passingMarks : exam.passingMarks;

    if (passingMarks > totalMarks) {
        throw new ApiError("Passing marks cannot exceed total marks", 400);
    }

    const examData = pick(updateData, EXAM_FIELDS);
    // The owning teacher is derived from the target group; a client-supplied
    // teacher field is deliberately ignored.
    examData.group = targetGroup._id;
    examData.teacher = targetGroup.teacherId;

    return await Exam.findByIdAndUpdate(id, examData, { new: true, runValidators: true });
};

exports.deleteExam = async (id, user) => {
    await verifyExamOwnership(id, user);
    return await Exam.findByIdAndDelete(id);
};

exports.publishExam = async (id, user) => {
    await verifyExamOwnership(id, user);
    return await Exam.findByIdAndUpdate(id, { status: "published" }, { new: true });
};
