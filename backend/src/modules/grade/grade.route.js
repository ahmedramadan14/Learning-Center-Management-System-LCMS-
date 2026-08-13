const express = require("express");
const authController = require("../auth/auth.controller.js");
const gradeController = require("./grade.controller");
const {
  createGradeValidator,
  updateGradeValidator,
  getGradeValidator,
  deleteGradeValidator,
} = require("./grade.validation");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Grades"),
    createGradeValidator,
    validatorMiddleware,
    gradeController.createGrade
  )
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), requireSecretaryPermission("Grades"),
    gradeController.getAllGrades
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student"), requireSecretaryPermission("Grades"),
    getGradeValidator,
    validatorMiddleware,
    gradeController.getGradeById
  )
  .put(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Grades"),
    updateGradeValidator,
    validatorMiddleware,
    gradeController.updateGrade
  )
  .delete(
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Grades"),
    deleteGradeValidator,
    validatorMiddleware,
    gradeController.deleteGrade
  );

module.exports = router;
