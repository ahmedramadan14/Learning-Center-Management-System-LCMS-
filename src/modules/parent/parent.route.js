const express = require("express")
const router = express.Router()

const {
    createParent,
    getAllParents,
    getOneParent,
    deleteParent,
    updateParent
} = require("../parent/parent.controller.js")

const {
    createParentValidation,
    getOneParentValidation,
    deleteOneParentValidation,
    updateParentValidation
} = require("../parent/parent.validation.js")

const authController = require("../auth/auth.controller.js")

router.use(authController.protect)

router.post("/", authController.allowedTo("admin", "secretary"), createParentValidation, createParent)
router.get("/", authController.allowedTo("admin", "secretary"), getAllParents)
router.get("/:id", getOneParentValidation, getOneParent)
router.delete("/:id", authController.allowedTo("admin", "secretary"), deleteOneParentValidation, deleteParent)
router.put("/:id", authController.allowedTo("admin", "secretary"), updateParentValidation, updateParent)

module.exports = router