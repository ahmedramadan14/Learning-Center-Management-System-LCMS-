const express = require("express");

const router = express.Router();

const gradeController = require("./grade.controller");

const {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator,
  deleteGradeValidator,
} = require("./grade.validation");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

router
  .route("/")
  .post(createGradeValidator, validatorMiddleware, gradeController.createGrade)
  .get(gradeController.getAllGrades);

router
  .route("/:id")
  .get(getGradeValidator, validatorMiddleware, gradeController.getGradeById)
  .put(updateGradeValidator, validatorMiddleware, gradeController.updateGrade)
  .delete(
    deleteGradeValidator,
    validatorMiddleware,
    gradeController.deleteGrade
  );

module.exports = router;