const mongoose = require("mongoose")

const secretariesSchema = new mongoose.Schema({
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
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


const secretarie = mongoose.model("Secretarie",secretariesSchema)

module.exports = secretarie