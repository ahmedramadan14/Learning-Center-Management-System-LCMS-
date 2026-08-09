const express = require("express");

const router = express.Router();

const groupController = require("./group.controller");

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
    createGroupValidator,
    validatorMiddleware,
    groupController.createGroup
  )
  .get(groupController.getAllGroups);


// Add Student To Group
router.post(
  "/:groupId/students/:studentCode",
  groupController.addStudentToGroup
);


// Remove Student From Group
router.delete(
  "/:groupId/students/:studentCode",
  groupController.removeStudentFromGroup
);


// Get Group Students
router.get(
  "/:groupId/students",
  groupController.getGroupStudents
);


router
  .route("/:id")
  .get(
    getGroupValidator,
    validatorMiddleware,
    groupController.getGroupById
  )
  .put(
    updateGroupValidator,
    validatorMiddleware,
    groupController.updateGroup
  )
  .delete(
    deleteGroupValidator,
    validatorMiddleware,
    groupController.deleteGroup
  );

module.exports = router;