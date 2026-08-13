const express = require("express");
const resultController = require("./result.controller");
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");
const {
  createResultRules,
  updateResultRules,
  idParamRule,
  examIdParamRule,
  studentCodeParamRule,
} = require("./result.validation");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(
    authController.allowedTo("admin", "secretary", "teacher", "student", "parent"),
    requireSecretaryPermission("Results"),
    resultController.getAllResults
  )
  .post(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Results"),
    createResultRules,
    validatorMiddleware,
    resultController.createResult
  );

router.get(
  "/student/:studentCode",
  authController.allowedTo("admin", "secretary", "teacher", "student", "parent"),
  requireSecretaryPermission("Results"),
  studentCodeParamRule,
  validatorMiddleware,
  resultController.getStudentResults
);

router.get(
  "/exam/:examId",
  authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Results"),
  examIdParamRule,
  validatorMiddleware,
  resultController.examResults
);

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "secretary", "teacher", "student", "parent"),
    requireSecretaryPermission("Results"),
    idParamRule,
    validatorMiddleware,
    resultController.getResult
  )
  .put(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Results"),
    updateResultRules,
    validatorMiddleware,
    resultController.updateResult
  )
  .delete(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Results"),
    idParamRule,
    validatorMiddleware,
    resultController.deleteResult
  );

module.exports = router;
