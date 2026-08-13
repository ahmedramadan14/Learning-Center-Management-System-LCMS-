const express = require("express");
const router = express.Router();
const teacherController = require("./teacher.controller");
const authController = require("../auth/auth.controller");
const {
  createTeacherValidation,
  updateTeacherValidation,
  teacherIdParamValidation,
} = require("./teacher.validation");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");

router.use(authController.protect);

router.get("/me", authController.allowedTo("teacher"), teacherController.getMyTeacherProfile);

router.get("/", authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Teachers"), teacherController.getTeachers);
router.get("/:id", authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Teachers"), teacherIdParamValidation, teacherController.getTeacherById);

router.post("/", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Teachers"), createTeacherValidation, teacherController.createTeacher);
router.patch("/:id", authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Teachers"), updateTeacherValidation, teacherController.updateTeacher);
router.delete("/:id", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Teachers"), teacherIdParamValidation, teacherController.deleteTeacher);

router.patch("/:id/approve", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Teachers"), teacherIdParamValidation, teacherController.approveTeacher);
router.patch("/:id/activate", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Teachers"), teacherIdParamValidation, teacherController.activateTeacher);
router.patch("/:id/deactivate", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Teachers"), teacherIdParamValidation, teacherController.deactivateTeacher);

module.exports = router;
