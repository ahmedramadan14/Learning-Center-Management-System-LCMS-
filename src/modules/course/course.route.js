const express = require("express");
const authController = require("../auth/auth.controller");
const courseController = require("./course.controller");

const router = express.Router();

router.use(authController.protect);

router.route("/")
  .get(courseController.getCourses)
  .post(authController.allowedTo("admin", "teacher", "secretary"), courseController.createCourse);

router.route("/:id")
  .get(courseController.getCourse)
  .patch(authController.allowedTo("admin", "teacher", "secretary"), courseController.updateCourse)
  .delete(authController.allowedTo("admin"), courseController.deleteCourse);

module.exports = router;
