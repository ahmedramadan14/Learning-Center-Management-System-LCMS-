const mongoose = require("mongoose")

const parentSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : false,
        unique : true
    },

    notifications : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "notifications"
    }],

    students : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "students"
    }],

    
}, {timestamps : true})

const parent = mongoose.model("parent",parentSchema)

module.exports = parent