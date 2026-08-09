const express = require('express');
const authController = require('../auth/auth.controller.js');
const fun = require('./attendance.controller.js');
const valid = require('./attendance.validation.js');

const router = express.Router();

router.use(authController.protect);

router.post('/create', authController.allowedTo("admin", "secretary", "teacher"), valid.ValidationCAttend, fun.createattendance);
router.put('/update/:id', authController.allowedTo("admin", "secretary", "teacher"), valid.ValidationUAttend, fun.updateattendance);

router.get('/allattendance', authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), fun.getallattendance);

router.get('/student/:studentCode', authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), fun.getattendancebyid);

router.delete('/:id', authController.allowedTo("admin", "secretary", "teacher"), fun.deleteAttendance);

module.exports = router;