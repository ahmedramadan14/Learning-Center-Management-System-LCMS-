const express = require('express');

const fun = require('./attendance.controller.js')
const valid = require('./attendance.validation.js')

const router = express.Router();
router.post('/create', valid.ValidationCAttend, fun.createattendance);
router.put('/update/:studentId', valid.ValidationUAttend, fun.updateattendance);
router.get('/allattendance', fun.getallattendance);
router.get('/studentattendance/:studentId', valid.ValidationId, fun.getattendancebyid);
router.get('/delete/:studentId', valid.ValidationId, fun.deleteAttendance);
module.exports = router;