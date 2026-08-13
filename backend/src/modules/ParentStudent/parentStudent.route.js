const express = require("express");
const router = express.Router();
const parentStudentController = require("./parentStudent.controller");
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");
const {
  createParentStudentValidation,
  linkChildValidation,
  idParamValidation,
  parentParamValidation,
  studentParamValidation,
} = require("./parentStudent.validation");

router.use(authController.protect);

router.post(
  "/link-child",
  authController.allowedTo("parent"),
  linkChildValidation,
  validatorMiddleware,
  parentStudentController.linkChildByCode
);

router.get(
  "/my-children",
  authController.allowedTo("parent"),
  parentStudentController.getMyChildren
);

router.get(
  "/parent/:parentId",
  authController.allowedTo("admin", "secretary"),
  requireSecretaryPermission("Parents"),
  parentParamValidation,
  validatorMiddleware,
  parentStudentController.getParentStudents
);

router.get(
  "/student/:studentId",
  authController.allowedTo("admin", "secretary"),
  requireSecretaryPermission("Parents"),
  studentParamValidation,
  validatorMiddleware,
  parentStudentController.getStudentParents
);

router
  .route("/")
  .post(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    createParentStudentValidation,
    validatorMiddleware,
    parentStudentController.createParentStudent
  )
  .get(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    parentStudentController.getAllParentStudents
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    idParamValidation,
    validatorMiddleware,
    parentStudentController.getOneParentStudent
  )
  .delete(
    authController.allowedTo("admin", "secretary"),
    requireSecretaryPermission("Parents"),
    idParamValidation,
    validatorMiddleware,
    parentStudentController.deleteParentStudent
  );

module.exports = router;
