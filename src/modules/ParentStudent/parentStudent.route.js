const express = require("express");
const router = express.Router();
const parentStudentController = require("./parentStudent.controller.js");
const authController = require("../auth/auth.controller.js");
const validatorMiddleware = require("../../middlewares/validatorMiddleware.js");
const {
  createParentStudentValidation,
  linkChildValidation,
  idParamValidation,
  parentParamValidation,
  studentParamValidation,
} = require("./parentStudent.validation.js");

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
  parentParamValidation,
  validatorMiddleware,
  parentStudentController.getParentStudents
);

router.get(
  "/student/:studentId",
  authController.allowedTo("admin", "secretary"),
  studentParamValidation,
  validatorMiddleware,
  parentStudentController.getStudentParents
);

router
  .route("/")
  .post(
    authController.allowedTo("admin", "secretary"),
    createParentStudentValidation,
    validatorMiddleware,
    parentStudentController.createParentStudent
  )
  .get(
    authController.allowedTo("admin", "secretary"),
    parentStudentController.getAllParentStudents
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "secretary"),
    idParamValidation,
    validatorMiddleware,
    parentStudentController.getOneParentStudent
  )
  .delete(
    authController.allowedTo("admin", "secretary"),
    idParamValidation,
    validatorMiddleware,
    parentStudentController.deleteParentStudent
  );

module.exports = router;