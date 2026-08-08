const attendanceModel = require("./attendance.model");



const ValidationCAttend = async (req,res,next)=>{

    try{
        // const { studendId, groupId, status, sessionId, method ,date}=req.body
        //   if(!studendId || !groupId || !status || !sessionId || !date){
        //     return res.status(400).json("Please Enter All Fields")
        //   }
        // if (status != "Present" && status!= "Absent" && status!="Late" && status!= "Excused"){
        //     return res.status(400).json("Invalid Status")
        // }
        // if(isNaN(Date.parse(date))){
        //     return res.status(400).json("Invalid Date")   
        // }
         next();
    }

    catch(err){
        return res.status(404).json("error");
    }
}
const ValidationUAttend = async(req, res, next) => {

    try {
        // const { studendId, status} = req.body
        // if (!studendId || !status) {
        //     return res.status(400).json("Please Enter All Fields")
        // }
        // if (status != "Present" && status != "Absent" && status != "Late" && status != "Excused") {
        //     return res.status(400).json("Invalid Status")
        // }
        next();
    }

    catch (err) {
        return res.status(404).json("error");
    }
}

const ValidationId = async(req, res, next) => {

    try {
        // const { studentId } = req.body
        // if (!studentId) {
        //     return res.status(400).json("Please Enter studentId")
        // }
        // const attend = await attendanceModel.findOne({ studentId: studentId });
        // if(!attend){
        //     return res.status(400).json("Invalid studentId")

        // }
        next();
    }

    catch (err) {
        return res.status(404).json("error");
    }
}

module.exports = { ValidationCAttend, ValidationUAttend, ValidationId }