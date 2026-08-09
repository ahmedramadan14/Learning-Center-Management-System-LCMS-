const express = require("express");
const authController = require("../auth/auth.controller.js");

const router = express.Router();

const groupController = require("./group.controller");
router.use(authController.protect);

const {
  createGroupValidator,
  updateGroupValidator,
  getGroupValidator,
  deleteGroupValidator,
} = require("./group.validation");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

router
  .route("/")
  .post(
    authController.allowedTo("admin", "teacher", "secretary"),
    createGroupValidator,
    validatorMiddleware,
    groupController.createGroup
  )
  .get(
    authController.allowedTo("admin", "teacher", "secretary", "student"),
    groupController.getAllGroups);

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "teacher", "secretary"),
    getGroupValidator,
    validatorMiddleware,
    groupController.getGroupById
  )
  .put(
    authController.allowedTo("admin", "teacher", "secretary"),
    updateGroupValidator,
    validatorMiddleware,
    groupController.updateGroup
  )
  .delete(
    authController.allowedTo("admin", "teacher", "secretary"),
    deleteGroupValidator,
    validatorMiddleware,
    groupController.deleteGroup
  );

module.exports = router;