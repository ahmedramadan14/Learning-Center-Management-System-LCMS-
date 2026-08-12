const express = require('express');
const router = express.Router();

const authController = require('./auth.controller.js');
const { ValidationSignup, ValidationLogin } = require('./auth.validation.js');

router.post('/signup', ValidationSignup, authController.signup);
router.post('/login', ValidationLogin, authController.login);

// router.post('/forgotPassword', authController.forgotPassword);
// router.post('/verifyPassResetCode', authController.verifyPassResetCode);
// router.put('/resetPassword', authController.resetPassword);


router.use(authController.protect);

router.post('/logout', authController.logout);

module.exports = router;