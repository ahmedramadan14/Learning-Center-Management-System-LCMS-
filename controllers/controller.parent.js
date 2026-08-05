const parentService = require("../services/service.parent");

// Create Parent

const createParent = async (req, res) => {
    try {
        const newParent = await parentService.createParent(req.body)

        res.status(201).json({
            message: "parent created successfully",
            parent: newParent
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Get All Parents

const getAllParent = async (req, res) => {
    try {
        const getAllNewParents = await parentService.getAllParents()

        res.status(200).json({
            parents: getAllNewParents
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Get Parent By Id

const getOneParent = async (req, res) => {
    try {
        const id = req.params.id

        const getOneNewParent = await parentService.getOneParent(id)

        if (!getOneNewParent) {
            return res.status(404).json({
                message: "parent not found"
            })
        }

        res.status(200).json({
            parent: getOneNewParent
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Delete Parent

const deleteOneParent = async (req, res) => {
    try {
        const id = req.params.id

        const deleteOneNewParent = await parentService.deleteOneParent(id)

        if (!deleteOneNewParent) {
            return res.status(404).json({
                message: "parent not found"
            })
        }

        res.status(200).json({
            message: "parent deleted successfully",
            parent: deleteOneNewParent
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

// Update Parent

const updateOneParent = async (req, res) => {
    try {
        const id = req.params.id

        const updateOneNewParent = await parentService.updateOneParent(
            id,
            req.body
        )

        if (!updateOneNewParent) {
            return res.status(404).json({
                message: "parent not found"
            })
        }

        res.status(200).json({
            message: "parent updated successfully",
            parent: updateOneNewParent
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    createParent,
    getAllParent,
    getOneParent,
    deleteOneParent,
    updateOneParent
}