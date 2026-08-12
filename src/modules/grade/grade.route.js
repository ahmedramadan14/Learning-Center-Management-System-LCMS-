const express = require("express");
const authController = require("../auth/auth.controller.js");
const gradeController = require("./grade.controller.js");
const {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator,
  deleteGradeValidator,
} = require("./grade.validation.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware.js");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(
    authController.allowedTo("admin", "teacher"), 
    createGradeValidator,
    validatorMiddleware,
    gradeController.createGrade
  )
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student", "parent"),
    gradeController.getAllGrades
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student"),
    getGradeValidator,
    validatorMiddleware,
    gradeController.getGradeById
  )
  .put(
    authController.allowedTo("admin", "teacher"), 
    updateGradeValidator,
    validatorMiddleware,
    gradeController.updateGrade
  )
  .delete(
    authController.allowedTo("admin", "teacher"), 
    deleteGradeValidator,
    validatorMiddleware,
    gradeController.deleteGrade
  );

module.exports = router;