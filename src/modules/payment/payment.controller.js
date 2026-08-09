const asyncHandler = require("../../middlewares/asyncHandler");
const {
  createPayment,
  listPayments,
  findPaymentById,
  updatePayment,
  recordPayment,
} = require("./payment.service");

// Actor must always come from the authenticated token — never from the request body
const getActorId = (req) => req.user._id;

// Create a new payment
const create = asyncHandler(async (req, res, next) => {
  try {
    const payment = await createPayment(req.body, getActorId(req));
    res.status(201).json({
      status: "success",
      data: { payment },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "A payment for this student, group, and cycle already exists.",
      });
    }
    next(err);
  }
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
const update = asyncHandler(async (req, res, next) => {
  try {
    const payment = await updatePayment(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      data: { payment },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "A payment for this student, group, and cycle already exists.",
      });
    }
    next(err);
  }
});

// Record a payment amount (partial or full)
const record = asyncHandler(async (req, res) => {
  const payment = await recordPayment(
    req.params.id,
    req.body.amount,
    getActorId(req)
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