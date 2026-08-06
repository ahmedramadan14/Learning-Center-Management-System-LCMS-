const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const authController = require('../auth/auth.controller');

router.get('/getMe', authController.protect, userController.getLoggedUserData, userController.getUserById);
router.put('/changeMyPassword', authController.protect, userController.updateLoggedUserPassword);
router.put('/updateMe', authController.protect, userController.updateLoggedUserData);

router.use(authController.protect, authController.allowedTo('admin'));

router.route('/')
    .post(userController.createUser)
    .get(userController.getUsers);

router.get('/role/:role', userController.getUsersByRole);

router.route('/:id')
    .get(userController.getUserById)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router.patch('/:id/assign-role', userController.assignRole);
router.patch('/:id/activate', userController.activateUser);
router.patch('/:id/deactivate', userController.deactivateUser);

module.exports = router;