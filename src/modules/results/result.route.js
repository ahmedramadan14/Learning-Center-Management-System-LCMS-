const express = require("express");
const router = express.Router();
const resultController = require("./result.controller");
const validate = require("../../middlewares/validate");
const {
  createResultRules,
  updateResultRules,
  idParamRule,
  examIdParamRule,
  studentCodeParamRule,
} = require("./result.validation");

router.route("/")
  .get(resultController.getAllResults)
  .post(createResultRules, validate, resultController.createResult);

// specific routes MUST come before /:id, or "student"/"exam" get swallowed as an :id param
router.get("/student/:studentCode", studentCodeParamRule, validate, resultController.getStudentResults);
router.get("/exam/:examId", examIdParamRule, validate, resultController.examResults);

router.route("/:id")
  .get(idParamRule, validate, resultController.getResult)
  .put([...idParamRule, ...updateResultRules], validate, resultController.updateResult)
  .delete(idParamRule, validate, resultController.deleteResult);

module.exports = router;