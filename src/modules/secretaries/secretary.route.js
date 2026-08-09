const express = require("express")
const router = express.Router()

const {
    createSecretarie,
    getAllSecretarie,
    getOneSecretarie,
    deleteOneSecretarie,
    updateOneSecretarie
} = require("../secretaries/secretary.controller")

const {
    createSecretarieValidation,
    getOneSecretarieValidation,
    deleteOneSecretarieValidation,
    updateSecretarieValidation
} = require("../secretaries/secretary.validation")

// const  validation  = require("../validation/validationResult")


router.post("/", createSecretarieValidation, createSecretarie)
router.get("/", getAllSecretarie)
router.get("/:id", getOneSecretarieValidation, getOneSecretarie)
router.delete("/:id", deleteOneSecretarieValidation, deleteOneSecretarie)
router.put("/:id", updateSecretarieValidation, updateOneSecretarie)

module.exports = router