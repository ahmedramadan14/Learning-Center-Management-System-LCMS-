const express = require("express");
const router = express.Router();
const resultController = require("./result.controller");
const validate = require("../../middlewares/validate");
const { createResultRules, updateResultRules, idParamRule } = require("./result.validation");

router.route("/")
  .get(resultController.getAllResults)
  .post(createResultRules, validate, resultController.createResult);

router.route("/:id")
  .get(idParamRule, validate, resultController.getResult)
  .put([...idParamRule, ...updateResultRules], validate, resultController.updateResult)
  .delete(idParamRule, validate, resultController.deleteResult);

module.exports = router;