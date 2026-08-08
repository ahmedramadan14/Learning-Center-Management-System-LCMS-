const attendanceModel = require("./attendance.model");
const createattendance = async (attend) => {


        const attendance = await attendanceModel.create(attend);
        return attendance;
}


const updateattendance = async (id, updated) => {

        const update = await attendanceModel.findOneAndUpdate({ studentId: id }, updated, { new: true, runValidators: true })
        return update;

}

const getallattendance = async () => {
        const allattendance = await attendanceModel.find();
        return allattendance;
}

const getbyidattendance = async (id) => {
        const attendance = await attendanceModel.findOne({ studentId: id });
        return attendance;
}


const deleteattendance = async (id) => {

        const deletedattendance = await attendanceModel.findOneAndDelete({ studentId: id });
        return deletedattendance;
};


module.exports = { deleteattendance, getbyidattendance, getallattendance, updateattendance, createattendance }