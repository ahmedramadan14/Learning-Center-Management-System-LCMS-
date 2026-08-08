const mongoose = require("mongoose")

const secretariesSchema = new mongoose.Schema({
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users",
            required : true,
            unique : true
        },


        permission : {
            type : [String],
            default : []
        },

        department : {
            type : String,
            required : true,
        }

}, {timestamps : true})


const secretarie = mongoose.model("secretarie",secretariesSchema)

module.exports = secretarie