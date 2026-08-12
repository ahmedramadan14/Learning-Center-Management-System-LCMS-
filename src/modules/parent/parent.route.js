const express = require("express");
const router = express.Router();
const parentController = require("./parent.controller.js");
const {
  createParentValidation,
  getOneParentValidation,
  deleteOneParentValidation,
  updateParentValidation,
} = require("./parent.validation.js");
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware.js");

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
    createParentValidation,
    validatorMiddleware,
    parentController.createParent
  )
  .get(
    authController.allowedTo("admin", "secretary"),
    parentController.getAllParents
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "secretary", "parent"),
    getOneParentValidation,
    validatorMiddleware,
    parentController.getOneParent
  )
  .put(
    authController.allowedTo("admin", "secretary", "parent"),
    updateParentValidation,
    validatorMiddleware,
    parentController.updateParent
  )
  .delete(
    authController.allowedTo("admin", "secretary"),
    deleteOneParentValidation,
    validatorMiddleware,
    parentController.deleteParent
  );

module.exports = router;