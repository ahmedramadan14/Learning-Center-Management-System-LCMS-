const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  record,
  recordByCode,
} = require("./payment.controller");

const {
  validatePaymentId,
  validateCreatePayment,
  validateUpdatePayment,
  validateRecordPayment,
  validateRecordPaymentByCode,
  validatePaymentList,
} = require("./payment.validation");

const authController = require("../auth/auth.controller.js");

const router = express.Router();

router.use(authController.protect);
router.use(authController.allowedTo("admin", "secretary"));

// Get All + Create
router
  .route("/")
  .get(validatePaymentList, getAll)
  .post(validateCreatePayment, create);

// Record Payment by Student Code
router.post(
  "/by-code",
  validateRecordPaymentByCode,
  recordByCode
);

// Record Payment by Payment ID
router.post(
  "/:id/record",
  validatePaymentId,
  validateRecordPayment,
  record
);

// Get One + Update
router
  .route("/:id")
  .get(validatePaymentId, getOne)
  .patch(validatePaymentId, validateUpdatePayment, update);

module.exports = router;