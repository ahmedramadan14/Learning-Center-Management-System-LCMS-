const express = require("express");
const studentController = require("./student.controller");
const authController = require('../auth/auth.controller');

const router = express.Router();

router.route('/')
    .post(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.createStudent)
    .get(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.getStudents);

router.route('/code')
    .post(
        authController.protect, 
        authController.allowedTo('admin', 'teacher', 'secretary'), 
        studentController.getStudentByCode
    );

router.route('/:studentCode')
    .patch(authController.protect, authController.allowedTo('admin', 'teacher', 'secretary'), studentController.updateStudent)
    .delete(authController.protect, authController.allowedTo('admin', 'teacher', 'secretary'), studentController.deleteStudent);
    
router.route('/:id')
    .get(authController.protect , authController.allowedTo('admin', 'teacher', 'secretary') , studentController.getStudentById)





module.exports = router;