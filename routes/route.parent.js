const express = require("express")
const router = express.Router()

const {
    createParent,
    getAllParent,
    getOneParent,
    deleteOneParent,
    updateOneParent
} = require("../controllers/controller.parent")

const {
    createParentValidation,
    getOneParentValidation,
    deleteOneParentValidation,
    updateParentValidation
} = require("../validation/validation.parent")

const  validation  = require("../validation/validationResult")

router.post("/",createParentValidation, validation, createParent)
router.get("/", getAllParent)
router.get("/:id",getOneParentValidation, validation, getOneParent)
router.delete("/:id",deleteOneParentValidation, validation, deleteOneParent)
router.put("/:id",updateParentValidation, validation, updateOneParent)

module.exports = router