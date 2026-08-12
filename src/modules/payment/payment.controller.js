const asyncHandler = require("../../middlewares/asyncHandler");
const paymentService = require("./payment.service");

const create = asyncHandler(async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.body, req.user);
    res.status(201).json({
      status: "success",
      data: { payment },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "A payment for this student, group, and session date already exists.",
      });
    }
    next(err);
  }
});

const getAll = asyncHandler(async (req, res) => {
  const result = await paymentService.listPayments(req.query, req.user);
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

const getOne = asyncHandler(async (req, res) => {
  const payment = await paymentService.findPaymentById(req.params.id, req.user);
  res.status(200).json({
    status: "success",
    data: { payment },
  });
});

const update = asyncHandler(async (req, res, next) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body, req.user);
    res.status(200).json({
      status: "success",
      data: { payment },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "A payment for this student, group, and session date already exists.",
      });
    }
    next(err);
  }
});

const record = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordPayment(
    req.params.id,
    req.body.amount,
    req.user
  );
  res.status(200).json({
    status: "success",
    data: { payment },
  });
});

const createByCode = asyncHandler(async (req, res, next) => {
  try {
    const payment = await paymentService.createPaymentByCode(req.body, req.user);
    res.status(201).json({
      status: "success",
      data: { payment },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: "fail",
        message: "A payment for this student, group, and session date already exists.",
      });
    }
    next(err);
  }
});

module.exports = {
  create,
  getAll,
  getOne,
  update,
  record,
  createByCode,
};