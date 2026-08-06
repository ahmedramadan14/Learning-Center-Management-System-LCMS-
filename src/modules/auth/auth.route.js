const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// router.post('/forgotPassword', authController.forgotPassword);
// router.post('/verifyPassResetCode', authController.verifyPassResetCode);
// router.put('/resetPassword', authController.resetPassword);


router.use(authController.protect);

router.post('/logout', authController.logout);

module.exports = router;