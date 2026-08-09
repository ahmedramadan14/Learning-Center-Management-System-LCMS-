const express = require("express");
const resultController = require("./result.controller");
const authController = require("../auth/auth.controller.js");

const router = express.Router();

router.use(authController.protect);

router.route("/")
  .get(authController.allowedTo("admin", "secretary", "teacher", "student", "parent"), resultController.getAllResults)
  .post(authController.allowedTo("admin", "secretary", "teacher"), resultController.createResult);

router.get("/student/:studentCode", authController.allowedTo("admin", "secretary", "teacher", "student", "parent"), resultController.getStudentResults);
router.get("/exam/:examId", authController.allowedTo("admin", "secretary", "teacher"), resultController.examResults);

router.route("/:id")
  .get(resultController.getResult)
  .put(authController.allowedTo("admin", "secretary", "teacher"), resultController.updateResult)
  .delete(authController.allowedTo("admin", "teacher","secretary"), resultController.deleteResult);

module.exports = router;