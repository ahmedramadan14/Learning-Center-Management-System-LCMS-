const Student = require("./student.model");
const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const { generateUniqueStudentCode } = require("./student.utils");

// @desc  Create a student account (used by a secretary/teacher).
const createStudent = async (data) => {
    const {
        name, username, phone, password,
        firstName, lastName, parentPhone, email, gender, avatar, grade,
        parentId, groupId, createdById
    } = data;

    const hashedPassword = await bcrypt.hash(password, 12);

    let teacherId = null;
    if (createdById) {
        const secretary = await User.findById(createdById).select("createdBy role");
        teacherId = secretary?.role === 'secretary'
            ? secretary.createdBy
            : createdById;
    }

    const displayName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || username || "Student");

    const user = await User.create({
        name: displayName,
        phone,
        password: hashedPassword,
        role: 'student',
        ...(teacherId && { createdBy: teacherId }),
    });

    const studentCode = await generateUniqueStudentCode();

    const createdStudent = await Student.create({
        userId: user._id,
        studentCode,
        parentPhone,
        gender,
        grade,
        ...(parentId && { parentId }),
        ...(groupId && { groups: [groupId] }),
        ...(createdById && { createdById }),
    });

    const populatedStudent = await Student.findById(createdStudent._id)
        .populate("userId", "name phone role email")
        .populate("parentId")
        // .populate("groups");

    return populatedStudent;
};

const getStudents = async () => {
    return await Student.find()
        .populate("userId", "name phone role email")
        .populate("parentId")
        // .populate("groups");
};

const getStudentsById = async (id) => {
    return await Student.findById(id)
        .populate("userId", "name phone role email")
        .populate("parentId")
        // .populate("groups");
};

const ALLOWED_UPDATE_FIELDS = [
    "grade",
    "gender",
    "parentPhone",
    "birthDate",
    "isActive",
];

const updateStudent = async (id, data) => {
    const filteredData = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
            filteredData[key] = data[key];
        }
    }

    return await Student.findByIdAndUpdate(id, filteredData, { new: true, runValidators: true })
        .populate("userId", "name phone role email")
        .populate("parentId");
        // .populate("groups");
};

const deleteStudent = async (id) => {
    const student = await Student.findByIdAndDelete(id);
    if (student && student.userId) {
        await User.findByIdAndDelete(student.userId).catch(() => {});
    }
    return student;
};

const linkParent = async (id, parentId) => {
    return await Student.findByIdAndUpdate(id, { parentId }, { new: true, runValidators: true })
        .populate("userId", "name phone role email")
        .populate("parentId")
        // .populate("groups");
};

const getStudentByCode = async (studentCode) => {
    return await Student.findOne({ studentCode })
        .populate("userId", "name phone role email")
        .populate("parentId")
        // .populate("groups");
};

module.exports = {
    createStudent,
    getStudents,
    getStudentsById,
    getStudentByCode,
    updateStudent,
    deleteStudent,
    linkParent,
};
 