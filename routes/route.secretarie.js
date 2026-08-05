const express = require("express")
const router = express.Router()

const {
    createSecretarie,
    getAllSecretarie,
    getOneSecretarie,
    deleteOneSecretarie,
    updateOneSecretarie
} = require("../controllers/controller.secretarie")

const {
    createSecretarieValidation,
    getOneSecretarieValidation,
    deleteOneSecretarieValidation,
    updateSecretarieValidation
} = require("../validation/vaildation.secretarie")

const  validation  = require("../validation/validationResult")


router.post("/", createSecretarieValidation, validation, createSecretarie)
router.get("/", getAllSecretarie)
router.get("/:id", getOneSecretarieValidation, validation, getOneSecretarie)
router.delete("/:id", deleteOneSecretarieValidation, validation, deleteOneSecretarie)
router.put("/:id", updateSecretarieValidation, validation, updateOneSecretarie)

module.exports = router