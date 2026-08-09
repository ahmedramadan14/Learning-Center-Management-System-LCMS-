const mongoose = require("mongoose");
const Teacher = require("./teacher.model");
const User = require("../user/user.model");
const Group = require("../group/group.model");
const bcrypt = require("bcryptjs");
const ApiError = require("../../utils/ApiErrors");

const ALLOWED_UPDATE_FIELDS = ["description", "subject"];

const createTeacher = async (data) => {
    const { name, phone, password, description, subject } = data;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const [user] = await User.create(
            [
                {
                    name,
                    phone,
                    password: hashedPassword,
                    role: "teacher",
                    isApproved: true,
                },
            ],
            { session }
        );

        const [teacher] = await Teacher.create(
            [
                {
                    userId: user._id,
                    ...(description && { description }),
                    ...(subject && { subject }),
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return await Teacher.findById(teacher._id).populate("userId", "-password");
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

const getTeachers = async () => {
    return await Teacher.find().populate("userId", "-password");
};

const getTeacherById = async (id) => {
    return await Teacher.findById(id).populate("userId", "-password");
};


const updateTeacher = async (id, data) => {
    const filteredData = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (data[key] !== undefined) {
            filteredData[key] = data[key];
        }
    }

    return await Teacher.findByIdAndUpdate(id, filteredData, { new: true, runValidators: true })
        .populate("userId", "-password");
};


const deleteTeacher = async (id) => {
    const hasGroups = await Group.exists({ teacherId: id });
    if (hasGroups) {
        throw new ApiError(
            "Cannot delete teacher: they still have groups assigned. Reassign or delete those groups first, or use deactivate instead.",
            400
        );
    }

    const teacher = await Teacher.findByIdAndDelete(id);
    if (teacher && teacher.userId) {
        await User.findByIdAndDelete(teacher.userId).catch(() => {});
    }
    return teacher;
}

const activateTeacher = async (id) => {
    return await Teacher.findByIdAndUpdate(id, { isActive: true }, { new: true }).populate("userId", "-password");
};

const deactivateTeacher = async (id) => {
    return await Teacher.findByIdAndUpdate(id, { isActive: false }, { new: true }).populate("userId", "-password");
};


const approveTeacher = async (id) => {
    const teacher = await Teacher.findById(id);
    if (!teacher) return null;

    const updatedUser = await User.findByIdAndUpdate(
        teacher.userId,
        { isApproved: true },
        { new: true }
    ).select("-password");

    return updatedUser;
};

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