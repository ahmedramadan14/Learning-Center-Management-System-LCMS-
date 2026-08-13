// src/modules/student/student.route.js

const express = require("express");
const router = express.Router();
const studentController = require("./student.controller");
const { protect, allowedTo } = require("../auth/auth.controller");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");
const {
  createStudentValidation,
  updateStudentValidation,
  studentCodeParamValidation,
} = require("./student.validation");

router.use(protect);

router.get(
  "/my-code",
  allowedTo("student"),
  studentController.getMyCode
);

router.post("/", allowedTo("admin", "secretary"), requireSecretaryPermission("Students"), createStudentValidation, studentController.createStudent);
router.get("/", allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Students"), studentController.getStudents);

router.post("/code", allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Students"), studentController.getStudentByCode);

router
  .route("/:studentCode")
  .get(allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Students"), studentController.getStudentByCode)
  .patch(allowedTo("admin", "secretary"), requireSecretaryPermission("Students"), studentController.updateStudent)
  .delete(allowedTo("admin", "secretary"), requireSecretaryPermission("Students"), studentController.deactivateStudent);

module.exports = router;
