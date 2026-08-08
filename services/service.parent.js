const parent = require("../models/model.parent");

// create parent

const createParent = async (data) => {
    const newParent = await parent.create(data)

    return newParent
}

// Get All Parents

const getAllParents = async () => {
    const getAllNewParents = await parent.find();

    return getAllNewParents;
}

// Get Parent By Id

const getOneParent = async (id) => {
    const getOneNewParent = await parent.findById(id)

    return getOneNewParent
}

// delete parent

const deleteOneParent = async (id) => {
    const deleteOneNewParent = await parent.findByIdAndDelete(id)

    return deleteOneNewParent
}

// update parent

const updateOneParent = async (id, data) => {
    const updateOneNewParent = await parent.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    )

    return updateOneNewParent
}

module.exports = {
    createParent,
    getAllParents,
    getOneParent,
    deleteOneParent,
    updateOneParent
}