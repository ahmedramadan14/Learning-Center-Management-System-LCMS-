const authController = require("../auth/auth.controller.js");
const router = require("express").Router();
const validate = require("../../middlewares/errorMiddleware.js");
const { createExamRules, updateExamRules, idParamRule } = require("./exam.validation.js");
const examController = require("./exam.controller.js");


router.use(authController.protect);

router.route("/")
  .get(examController.getAllExams)
  .post(authController.allowedTo("admin", "secretary", "teacher"), createExamRules, validate, examController.createExam);

router.patch("/:id/publish", authController.allowedTo("admin", "secretary", "teacher"), idParamRule, validate, examController.publishExam);

router.route("/:id")
  .get(idParamRule, validate, examController.getExam)
  .put(authController.allowedTo("admin", "secretary", "teacher"), [...idParamRule, ...updateExamRules], validate, examController.updateExam)
  .delete(authController.allowedTo("admin", "teacher","secretary"), idParamRule, validate, examController.deleteExam);

  module.exports = router;