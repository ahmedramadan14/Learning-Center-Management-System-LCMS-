const mongoose = require("mongoose");
const Student = require("./student.model");
const User = require("../user/user.model");
const bcrypt = require("bcryptjs");
const { generateUniqueStudentCode } = require("./student.utils");

// @desc  Create a student account (used by a secretary/teacher), transactional.
const createStudent = async (data) => {
    const {
        name, username, phone, password,
        firstName, lastName, parentPhone, gender, grade,
        groupId, createdById
    } = data;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        let teacherId = null;
        if (createdById) {
            const creator = await User.findById(createdById)
                .select("createdBy role")
                .session(session);

            if (creator?.role === "secretary") {
                teacherId = creator.createdBy || null;
            } else if (creator?.role === "teacher") {
                teacherId = creator._id;
            }
        }

        const displayName =
            name ||
            (firstName && lastName ? `${firstName} ${lastName}` : firstName || username || "Student");

        const [user] = await User.create(
            [
                {
                    name: displayName,
                    phone,
                    password: hashedPassword,
                    role: "student",
                    ...(teacherId && { createdBy: teacherId }),
                },
            ],
            { session }
        );

        const studentCode = await generateUniqueStudentCode(session);

        const [createdStudent] = await Student.create(
            [
                {
                    userId: user._id,
                    studentCode,
                    parentPhone,
                    gender,
                    grade,
                    ...(groupId && { groups: [groupId] }),
                    ...(createdById && { createdById }),
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return await Student.findById(createdStudent._id).populate(
            "userId",
            "name phone role email"
        );
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

const getStudents = async () => {
    return await Student.find({ isActive: true }).populate(
        "userId",
        "name phone role email"
    );
};


const getStudentsById = async (id) => {
    return await Student.findById(id).populate("userId", "name phone role email");
};

const ALLOWED_UPDATE_FIELDS = [
    "grade",
    "name",
    "phone",
    "parentPhone"
];

const updateStudent = async (studentCode, data) => {
    const filteredData = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined && key !== 'isActive') { 
            filteredData[key] = data[key];
        }
    }

console.log("Data to be updated:", filteredData);

    return await Student.findOneAndUpdate(
        { studentCode, isActive: true },
        { $set: filteredData },
        { new: true, runValidators: true }
    ).populate("userId", "name phone role email");
};

const deleteStudentByCode = async (studentCode) => {
    const student = await Student.findOneAndUpdate(
        { studentCode, isActive: true },
        { isActive: false },
        { new: true }
    );

    if (!student) return null;

    if (student.userId) {
        await User.findByIdAndUpdate(student.userId, { isActive: false }).catch(() => {});
    }

    return student;
};

const getStudentByCode = async (studentCode) => {
    return await Student.findOne({ studentCode, isActive: true }).populate(
        "userId",
        "name phone role email"
    );
};

module.exports = {
    createStudent,
    getStudents,
    getStudentsById,
    getStudentByCode,
    updateStudent,
    deleteStudentByCode,
};