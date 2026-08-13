const express = require("express");
const router = express.Router();
const parentController = require("./parent.controller");
const {
  createParentValidation,
  getOneParentValidation,
  deleteOneParentValidation,
  updateParentValidation,
} = require("./parent.validation");
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");

router.use(authController.protect);

router.get(
  "/dashboard",
  authController.allowedTo("parent"),
  parentController.getParentDashboard
);

router
  .route("/")
  .post(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    createParentValidation,
    validatorMiddleware,
    parentController.createParent
  )
  .get(
    authController.allowedTo("admin", "teacher", "secretary"),
    requireSecretaryPermission("Parents"),
    parentController.getAllParents
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    getOneParentValidation,
    validatorMiddleware,
    parentController.getOneParent
  )
  .put(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    updateParentValidation,
    validatorMiddleware,
    parentController.updateParent
  )
  .delete(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    deleteOneParentValidation,
    validatorMiddleware,
    parentController.deleteParent
  );

module.exports = router;
