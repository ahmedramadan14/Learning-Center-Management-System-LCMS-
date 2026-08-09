const mongoose = require("mongoose")
const attendanceSchema = new mongoose.Schema({

    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:[true, "StudentId is required"]
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: [true, "groupId is required"]
    },
    date :{
         type: Date,
          required: [true, "Date is required"],
          default : Date.now
    },
    status:{
        type: String,
        enum: ["Present" , "Absent" , "Late" , "Excused"],
        required: [true, "Status is required"]
    },
    method :{
        type: String,
        default:"Manual",
        required: [true, "Method is required"]
    },
},{
    timestamps: true    
})

// منع تسجيل حضور مكرر لنفس الطالب في نفس الجروب في نفس اليوم
attendanceSchema.index(
  { studentId: 1, groupId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema)