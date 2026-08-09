const express = require("express");
const {
  create,
  getAll,
  getOne,
  update,
  record,
} = require("./payment.controller");
const {
  validatePaymentId,
  validateCreatePayment,
  validateUpdatePayment,
  validateRecordPayment,
  validatePaymentList,
} = require("./payment.validation");
const authController = require("../auth/auth.controller.js");

const router = express.Router();

router.use(authController.protect);
router.use(authController.allowedTo("admin", "secretary"));

router
  .route("/")
  .get(validatePaymentList, getAll)
  .post(validateCreatePayment, create);

router.post("/:id/record", validatePaymentId, validateRecordPayment, record);

router
  .route("/:id")
  .get(validatePaymentId, getOne)
  .patch(validatePaymentId, validateUpdatePayment, update);

module.exports = router;