const asyncHandler = require("../../middlewares/asyncHandler");
const {
  createPayment,
  listPayments,
  findPaymentById,
  updatePayment,
  recordPayment,
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

// Get single payment by id
const getOne = asyncHandler(async (req, res) => {
  const payment = await findPaymentById(req.params.id);
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

// Record a payment amount (partial or full)
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

module.exports = {
  create,
  getAll,
  getOne,
  update,
  record,
};