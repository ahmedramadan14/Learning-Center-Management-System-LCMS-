const authController = require("../auth/auth.controller.js");
const router = require("express").Router();
const validate = require("../../middlewares/errorMiddleware.js");
const { createExamRules, updateExamRules, idParamRule } = require("./exam.validation.js");
const examController = require("./exam.controller.js");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");


router.use(authController.protect);

router.route("/")
  .get(authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), requireSecretaryPermission("Exams"), examController.getAllExams)
  .post(authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Exams"), createExamRules, validate, examController.createExam);

router.patch("/:id/publish", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Exams"), idParamRule, validate, examController.publishExam);

router.route("/:id")
  .get(authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), requireSecretaryPermission("Exams"), idParamRule, validate, examController.getExam)
  .put(authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Exams"), [...idParamRule, ...updateExamRules], validate, examController.updateExam)
  .delete(authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Exams"), idParamRule, validate, examController.deleteExam);

  module.exports = router;
