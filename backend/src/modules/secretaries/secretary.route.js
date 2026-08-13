const express = require("express");
const router = express.Router();
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const {
  createSecretary,
  getAllSecretaries,
  getOneSecretary,
  deleteOneSecretary,
  updateOneSecretary,
} = require("./secretary.controller");

const {
  createSecretaryValidation,
  getOneSecretaryValidation,
  deleteOneSecretaryValidation,
  updateSecretaryValidation,
} = require("./secretary.validation");

router.use(authController.protect);

router
  .route("/")
  .post(
    authController.allowedTo("admin", "teacher"),
    createSecretaryValidation,
    validatorMiddleware,
    createSecretary
  )
  .get(
    authController.allowedTo("admin", "teacher"),
    getAllSecretaries
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "teacher"),
    getOneSecretaryValidation,
    validatorMiddleware,
    getOneSecretary
  )
  .put(
    authController.allowedTo("admin", "teacher"),
    updateSecretaryValidation,
    validatorMiddleware,
    updateOneSecretary
  )
  .delete(
    authController.allowedTo("admin", "teacher"),
    deleteOneSecretaryValidation,
    validatorMiddleware,
    deleteOneSecretary
  );

module.exports = router;