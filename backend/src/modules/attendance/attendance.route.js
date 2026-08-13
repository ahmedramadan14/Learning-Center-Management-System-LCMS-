const express = require('express');
const authController = require('../auth/auth.controller.js');
const fun = require('./attendance.controller.js');
const valid = require('./attendance.validation.js');
const requireSecretaryPermission = require('../../middlewares/requireSecretaryPermission');

const router = express.Router();

router.use(authController.protect);

router.post(
    '/create',
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Attendance"),
    valid.ValidationCAttend,
    fun.createattendance
);

router.put(
    '/update/:id',
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Attendance"),
    valid.ValidationUAttend,
    fun.updateattendance
);

router.get(
    '/allattendance',
    authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), requireSecretaryPermission("Attendance"),
    fun.getallattendance
);

router.get(
    '/student/:studentCode',
    authController.allowedTo("admin", "teacher", "secretary", "student", "parent"), requireSecretaryPermission("Attendance"),
    valid.ValidationStudentCode,
    fun.getattendancebyid
);

router.delete(
    '/:id',
    authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Attendance"),
    valid.ValidationMongoId,
    fun.deleteAttendance
);

module.exports = router;
