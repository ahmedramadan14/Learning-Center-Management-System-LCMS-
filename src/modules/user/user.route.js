const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const authController = require("../auth/auth.controller");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const {
  updateLoggedUserPasswordValidation,
  updateLoggedUserDataValidation,
  userIdParamValidation,
  assignRoleValidation,
} = require("./user.validation");

router.get("/getMe", authController.protect, userController.getLoggedUserData, userController.getUserById);

router.put(
  "/changeMyPassword",
  authController.protect,
  updateLoggedUserPasswordValidation,
  validatorMiddleware,
  userController.updateLoggedUserPassword
);

router.put(
  "/updateMe",
  authController.protect,
  updateLoggedUserDataValidation,
  validatorMiddleware,
  userController.updateLoggedUserData
);

router.use(authController.protect, authController.allowedTo("admin"));

router.route("/")
  .post(userController.createUser)
  .get(userController.getUsers);

router.get("/role/:role", userController.getUsersByRole);

router.route("/:id")
  .get(userIdParamValidation, validatorMiddleware, userController.getUserById)
  .patch(userIdParamValidation, validatorMiddleware, userController.updateUser)
  .delete(userIdParamValidation, validatorMiddleware, userController.deleteUser);

router.patch("/:id/assign-role", assignRoleValidation, validatorMiddleware, userController.assignRole);
router.patch("/:id/activate", userIdParamValidation, validatorMiddleware, userController.activateUser);
router.patch("/:id/deactivate", userIdParamValidation, validatorMiddleware, userController.deactivateUser);

module.exports = router;