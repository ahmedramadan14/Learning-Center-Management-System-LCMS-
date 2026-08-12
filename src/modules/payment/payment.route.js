const express = require("express");
const {
  create,
  getAll,
  getOne,
  update,
  record,
  createByCode,
} = require("./payment.controller");
const {
  validatePaymentId,
  validateCreatePayment,
  validateCreateByCode,
  validateUpdatePayment,
  validateRecordPayment,
  validatePaymentList,
} = require("./payment.validation");
const authController = require("../auth/auth.controller.js");

const router = express.Router();

router.use(authController.protect);

router.get("/", validatePaymentList, getAll);
router.use(authController.allowedTo("admin", "secretary", "teacher"));

router.post("/", validateCreatePayment, create);
router.post("/by-code", validateCreateByCode, createByCode);
router.post("/:id/record", validatePaymentId, validateRecordPayment, record);

router
  .route("/:id")
  .get(validatePaymentId, getOne)
  .patch(validatePaymentId, validateUpdatePayment, update);

module.exports = router;