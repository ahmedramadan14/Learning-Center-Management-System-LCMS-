const express = require("express");
const {
  create,
  getAll,
  getOne,
  update,
  record,
  waive,
} = require("./payment.controller");
const {
  validatePaymentId,
  validateCreatePayment,
  validateUpdatePayment,
  validateRecordPayment,
  validateWaivePayment,
  validatePaymentList,
} = require("./payment.validation");

const router = express.Router();

// TODO: Add auth middleware
// const { protect, restrictTo } = require("../auth/auth.middleware");
// router.use(protect);

// Public routes for testing (will be protected later)
router
  .route("/")
  .get(validatePaymentList, getAll)
  .post(validateCreatePayment, create);

router.post("/:id/record", validatePaymentId, validateRecordPayment, record);

router.patch("/:id/waive", validatePaymentId, validateWaivePayment, waive);

router
  .route("/:id")
  .get(validatePaymentId, getOne)
  .patch(validatePaymentId, validateUpdatePayment, update);

module.exports = router;