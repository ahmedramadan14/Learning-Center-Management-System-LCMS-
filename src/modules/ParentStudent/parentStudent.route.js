const express = require("express");
const router = express.Router();
const {
  createParentStudent,
  getAllParentStudents,
  getOneParentStudent,
  getParentStudents,
  getStudentParents,
  deleteParentStudent,
  linkChildByCode,
  getMyChildren
} = require("../ParentStudent/parentStudent.controller");

const authController = require("../auth/auth.controller.js");

router.use(authController.protect);

router.post("/link-child", authController.allowedTo("parent"), linkChildByCode);
router.get("/my-children", authController.allowedTo("parent"), getMyChildren);

router.post("/",authController.allowedTo("admin", "secretary"),createParentStudent);
router.get("/", authController.allowedTo("admin", "secretary"), getAllParentStudents);
router.get("/:id", getOneParentStudent);
router.get("/parent/:parentId", getParentStudents);
router.get("/student/:studentId", getStudentParents);
router.delete("/:id",authController.allowedTo("admin", "secretary"), deleteParentStudent);

module.exports = router;