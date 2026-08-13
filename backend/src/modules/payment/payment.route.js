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
const requireSecretaryPermission = require("../../middlewares/requireSecretaryPermission");

const router = express.Router();

router.use(authController.protect);

router.get("/", authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Payments"), validatePaymentList, getAll);

router.post("/", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Payments"), validateCreatePayment, create);
router.post("/by-code", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Payments"), validateCreateByCode, createByCode);
router.post("/:id/record", authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Payments"), validatePaymentId, validateRecordPayment, record);

router
  .route("/:id")
  .get(authController.allowedTo("admin", "teacher", "secretary"), requireSecretaryPermission("Payments"), validatePaymentId, getOne)
  .patch(authController.allowedTo("admin", "secretary"), requireSecretaryPermission("Payments"), validatePaymentId, validateUpdatePayment, update);

module.exports = router;
