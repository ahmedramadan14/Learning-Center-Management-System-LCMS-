const express = require("express");
const router = express.Router();

const teacherController = require("./teacher.controller");
const authController = require('../auth/auth.controller');

router.use(authController.protect);

router.get('/', authController.allowedTo('admin'),teacherController.getTeachers);
router.get('/:id', authController.allowedTo('admin') , teacherController.getTeacherById);

// Admin / Teacher authorization for modifications
router.post('/', authController.allowedTo('admin'), teacherController.createTeacher);
router.patch('/:id', authController.allowedTo('admin'), teacherController.updateTeacher);
router.delete('/:id', authController.allowedTo('admin'), teacherController.deleteTeacher);

router.patch('/:id/approve', authController.allowedTo('admin'), teacherController.approveTeacher);
router.patch('/:id/activate', authController.allowedTo('admin'), teacherController.activateTeacher);
router.patch('/:id/deactivate', authController.allowedTo('admin'), teacherController.deactivateTeacher);

module.exports = router;    