const express = require("express");
const authController = require("../auth/auth.controller.js");
const groupController = require("./group.controller");
const {
  createGroupValidator,
  updateGroupValidator,
  getGroupValidator,
  deleteGroupValidator,
  validateGetGroupStudents,
  validateStudentGroupAction,
} = require("./group.validation");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const router = express.Router();

router.use(authController.protect);

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
    groupController.getAllGroups
  );

// Add Student To Group
router.post(
  "/:groupId/students/:studentCode",
  authController.allowedTo("admin", "teacher", "secretary"),
  validateStudentGroupAction,
  validatorMiddleware,
  groupController.addStudentToGroup
);

// Remove Student From Group
router.delete(
  "/:groupId/students/:studentCode",
  authController.allowedTo("admin", "teacher", "secretary"),
  validateStudentGroupAction,
  validatorMiddleware,
  groupController.removeStudentFromGroup
);

// GET /api/v1/groups/:id/students
router.get(
  "/:id/students",
  authController.allowedTo("admin", "secretary", "teacher"),
  validateGetGroupStudents,
  validatorMiddleware,
  groupController.getGroupStudents
);

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