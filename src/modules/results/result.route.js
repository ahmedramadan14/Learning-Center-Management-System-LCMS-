const express = require("express");
const resultController = require("./result.controller.js");
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware.js");
const {
  createResultRules,
  updateResultRules,
  idParamRule,
  examIdParamRule,
  studentCodeParamRule,
} = require("./result.validation.js");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(
    authController.allowedTo("admin", "secretary", "teacher", "student", "parent"),
    resultController.getAllResults
  )
  .post(
    authController.allowedTo("admin", "secretary", "teacher"),
    createResultRules,
    validatorMiddleware,
    resultController.createResult
  );

router.get(
  "/student/:studentCode",
  authController.allowedTo("admin", "secretary", "teacher", "student", "parent"),
  studentCodeParamRule,
  validatorMiddleware,
  resultController.getStudentResults
);

router.get(
  "/exam/:examId",
  authController.allowedTo("admin", "secretary", "teacher"),
  examIdParamRule,
  validatorMiddleware,
  resultController.examResults
);

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "secretary", "teacher", "student", "parent"),
    idParamRule,
    validatorMiddleware,
    resultController.getResult
  )
  .put(
    authController.allowedTo("admin", "secretary", "teacher"),
    updateResultRules,
    validatorMiddleware,
    resultController.updateResult
  )
  .delete(
    authController.allowedTo("admin", "teacher", "secretary"),
    idParamRule,
    validatorMiddleware,
    resultController.deleteResult
  );

module.exports = router;