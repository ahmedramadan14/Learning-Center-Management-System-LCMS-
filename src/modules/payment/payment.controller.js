const asyncHandler = require("../../middlewares/asyncHandler");
const {
  createPayment,
  listPayments,
  findPaymentById,
  updatePayment,
  recordPayment,
  waivePayment,
  sendReminder,
  getStudentPayments,
} = require("./payment.service");

// Get actor id from req.user or from body (fallback)
const getActorId = (req, fieldName) => req.user?._id || req.body[fieldName];

// Create a new payment
const create = asyncHandler(async (req, res) => {
  const payment = await createPayment(req.body, getActorId(req, "recordedBy"));
  res.status(201).json({
    status: "success",
    data: { payment },
  });
});

// List all payments with filters and pagination
const getAll = asyncHandler(async (req, res) => {
  const result = await listPayments(req.query);
  res.status(200).json({
    status: "success",
    results: result.payments.length,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
    data: { payments: result.payments },
  });
});

// Get single payment with full details
const getOne = asyncHandler(async (req, res) => {
  const payment = await findPaymentById(req.params.id, true); // true = populate
  res.status(200).json({
    status: "success",
    data: { payment },
  });
});

// Update payment basic info
const update = asyncHandler(async (req, res) => {
  const payment = await updatePayment(req.params.id, req.body);
  res.status(200).json({
    status: "success",
    data: { payment },
  });
});

// Record a payment amount
const record = asyncHandler(async (req, res) => {
  const payment = await recordPayment(
    req.params.id,
    req.body.amount,
    getActorId(req, "recordedBy")
  );
  res.status(200).json({
    status: "success",
    data: { payment },
  });
});

// Waive a payment
const waive = asyncHandler(async (req, res) => {
  const payment = await waivePayment(
    req.params.id,
    getActorId(req, "waivedBy"),
    req.body.waivedReason
  );
  res.status(200).json({
    status: "success",
    data: { payment },
  });
});

// Send reminder to student/parent
const remind = asyncHandler(async (req, res) => {
  const result = await sendReminder(req.params.id, getActorId(req, "createdBy"));
  res.status(200).json({
    status: "success",
    data: result,
  });
});

// Get payments for current logged-in student
const getMyPayments = asyncHandler(async (req, res) => {
  // req.user.student should be the student id (from auth middleware)
  if (!req.user.student) {
    return res.status(403).json({
      status: "fail",
      message: "Only students can access their payments.",
    });
  }
  
  const payments = await getStudentPayments(req.user.student);
  res.status(200).json({
    status: "success",
    results: payments.length,
    data: { payments },
  });
});

module.exports = {
  create,
  getAll,
  getOne,
  update,
  record,
  waive,
  remind,
  getMyPayments,
};