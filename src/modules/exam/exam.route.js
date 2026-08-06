const express = require("express");
const router = express.Router();
const examController = require("./exam.controller");
const validate = require("../../middlewares/validate");
const { createExamRules, updateExamRules, idParamRule } = require("./exam.validation");

router.route("/")
  .get(examController.getAllExams)
  .post(createExamRules, validate, examController.createExam);

router.route("/:id")
  .get(idParamRule, validate, examController.getExam)
  .put([...idParamRule, ...updateExamRules], validate, examController.updateExam)
  .delete(idParamRule, validate, examController.deleteExam);

module.exports = router;