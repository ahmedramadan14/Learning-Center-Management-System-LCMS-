const secretarieService = require("../secretaries/secretary.service");

// Create Secretarie

const createSecretarie = async (req, res) => {
    try {
        const createNewSecretarie = await secretarieService.createSecretarie(req.body)

        res.status(201).json({
            message: "secretarie created successfully",
            secretarie: createNewSecretarie
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Get All Secretaries

const getAllSecretarie = async (req, res) => {
    try {
        const getAllNewSecretaries = await secretarieService.getAllSecretaries()

        res.status(200).json({
            secretaries: getAllNewSecretaries
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Get One Secretarie

const getOneSecretarie = async (req, res) => {
    try {
        const id = req.params.id
        const getOneNewSecretarie = await secretarieService.getOneSecretarie(id)

        if (!getOneNewSecretarie) {
            return res.status(404).json({
                message: "secretarie not found"
            })
        }

        res.status(200).json({
            secretarie: getOneNewSecretarie
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Delete One Secretarie

const deleteOneSecretarie = async (req, res) => {
    try {
        const id = req.params.id
        const deleteOneNewSecretarie = await secretarieService.deleteOneSecretarie(id)

        if (!deleteOneNewSecretarie) {
            return res.status(404).json({
                message: "secretarie not found"
            })
        }

        res.status(200).json({
            message: "secretarie deleted successfully",
            secretarie: deleteOneNewSecretarie
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Update One Secretarie

const updateOneSecretarie = async (req, res) => {
    try {
        const id = req.params.id
        const updateOneNewSecretarie = await secretarieService.updateOneSecretarie(id, req.body)

        if (!updateOneNewSecretarie) {
            return res.status(404).json({
                message: "secretarie not found"
            })
        }

        res.status(200).json({
            message: "secretarie updated successfully",
            secretarie: updateOneNewSecretarie
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

module.exports = {
    createSecretarie,
    getAllSecretarie,
    getOneSecretarie,
    deleteOneSecretarie,
    updateOneSecretarie
}