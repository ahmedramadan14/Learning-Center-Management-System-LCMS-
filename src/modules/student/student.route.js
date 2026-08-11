// src/modules/student/student.route.js

const express = require("express");
const router = express.Router();
const studentController = require("./student.controller");
const { protect, allowedTo } = require("../auth/auth.controller");
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

router.use(allowedTo("admin", "teacher", "secretary"));

router
  .route("/")
  .post(createStudentValidation, studentController.createStudent)
  .get(studentController.getStudents);

router.post("/code", studentController.getStudentByCode);

router
  .route("/:studentCode")
  .get(studentController.getStudentByCode)
  .patch(studentController.updateStudent)
  .delete(studentController.deactivateStudent);

module.exports = router;