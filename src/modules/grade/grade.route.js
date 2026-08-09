const express = require("express");
const authController = require("../auth/auth.controller.js");

const router = express.Router();

const gradeController = require("./grade.controller");
router.use(authController.protect);
const {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator,
  deleteGradeValidator,
} = require("./grade.validation");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

router
  .route("/")
  .post(
    authController.allowedTo("admin", "teacher", "secretary"),
    createGradeValidator,
    validatorMiddleware,
    gradeController.createGrade
  )
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student"),
    gradeController.getAllGrades);

router
  .route("/:id")
  .get(getGradeValidator, validatorMiddleware, gradeController.getGradeById)
  .put(
    authController.allowedTo("admin", "teacher", "secretary"),
    updateGradeValidator,
    validatorMiddleware,
    gradeController.updateGrade
  ) .delete(
    authController.allowedTo("admin", "teacher", "secretary"),
    deleteGradeValidator,
    validatorMiddleware,
    gradeController.deleteGrade
  );

module.exports = router;