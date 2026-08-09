const secretarie = require("../secretaries/secretary.model")

// Create Secretarie

const createSecretarie = async (data) => {
    return await secretarie.create(data)
}

// Get All Secretaries

const getAllSecretaries = async () => {
    return await secretarie.find()
}

// Get One Secretarie

const getOneSecretarie = async (id) => {
    return await secretarie.findById(id)
}

// Delete One Secretarie

const deleteOneSecretarie = async (id) => {
    return await secretarie.findByIdAndDelete(id)
}

// Update One Secretarie

const updateOneSecretarie = async (id, data) => {
    return await secretarie.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    )
}

module.exports = {
    createSecretarie,
    getAllSecretaries,
    getOneSecretarie,
    deleteOneSecretarie,
    updateOneSecretarie
}