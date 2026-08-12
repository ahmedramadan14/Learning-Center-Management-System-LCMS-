const express = require("express");
const router = express.Router();
const teacherController = require("./teacher.controller");
const authController = require("../auth/auth.controller");
const {
  createTeacherValidation,
  updateTeacherValidation,
  teacherIdParamValidation,
} = require("./teacher.validation");

router.use(authController.protect);

router.get("/me", authController.allowedTo("teacher"), teacherController.getMyTeacherProfile);

router.get("/", authController.allowedTo("admin"), teacherController.getTeachers);
router.get("/:id", authController.allowedTo("admin", "teacher"), teacherIdParamValidation, teacherController.getTeacherById);

router.post("/", authController.allowedTo("admin"), createTeacherValidation, teacherController.createTeacher);
router.patch("/:id", authController.allowedTo("admin", "teacher"), updateTeacherValidation, teacherController.updateTeacher);
router.delete("/:id", authController.allowedTo("admin"), teacherIdParamValidation, teacherController.deleteTeacher);

router.patch("/:id/approve", authController.allowedTo("admin"), teacherIdParamValidation, teacherController.approveTeacher);
router.patch("/:id/activate", authController.allowedTo("admin"), teacherIdParamValidation, teacherController.activateTeacher);
router.patch("/:id/deactivate", authController.allowedTo("admin"), teacherIdParamValidation, teacherController.deactivateTeacher);

module.exports = router;