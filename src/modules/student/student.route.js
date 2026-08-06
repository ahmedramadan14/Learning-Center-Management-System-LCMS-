const express = require("express");
const studentController = require("./student.controller");
const authController = require('../auth/auth.controller');

const router = express.Router();

router.route('/')
    .post(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.createStudent)
    .get(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.getStudents);

router.route('/code/:studentCode')
    .get(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') ,studentController.getStudentByCode);

router.route('/:id/link-parent')
    .patch(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') ,studentController.linkParent);

router.route('/:id')
    .get(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.getStudentById)
    .patch(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.updateStudent)
    .delete(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.deleteStudent);



module.exports = router;