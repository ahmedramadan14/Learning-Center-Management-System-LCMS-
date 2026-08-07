const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiErrors");
const Payment = require("./payment.model");
const Notification = require("../notification/notification.model");

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const pick = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
    return result;
  }, {});

/* ---------- Payment notifications ---------- */

const paymentMessage = (event, payment) => {
  const amount = roundCurrency(payment.amountDue);
  const paid = roundCurrency(payment.amountPaid);
  const remaining = roundCurrency(payment.remaining);

  switch (event) {
    case "created":
      return {
        title: "New payment created",
        body: `A new payment of ${amount} was created. Remaining: ${remaining}.`,
      };
    case "partial":
      return {
        title: "Partial payment recorded",
        body: `We received ${paid}. Remaining: ${remaining}.`,
      };
    case "paid":
      return {
        title: "Payment completed",
        body: `The payment of ${amount} was fully paid. Thank you!`,
      };
    default:
      return {
        title: "Payment updated",
        body: `Payment status is now: ${payment.status}.`,
      };
  }
};

const getPaymentAudience = async (studentId) => {
  const Student = mongoose.models.Student;
  if (!Student) return null;

  const student = await Student.findById(studentId)
    .populate("parentIds", "userId")
    .lean();
  if (!student) return null;

  const userIds = new Set();
  if (student.userId) userIds.add(student.userId.toString());

  let hasParents = false;
  (student.parentIds || []).forEach((parent) => {
    if (parent && parent.userId) {
      userIds.add(parent.userId.toString());
      hasParents = true;
    }
  });

  return { userIds: [...userIds], hasParents };
};

const notifyPayment = async (payment, event, actorId) => {
  try {
    const audience = await getPaymentAudience(payment.studentId);
    if (!audience || audience.userIds.length === 0) return null;

    const { title, body } = paymentMessage(event, payment);

    return await Notification.create({
      title,
      body,
      type: "payment",
      targetRole: audience.hasParents ? "parents" : "students",
      targetUserIds: audience.userIds,
      createdBy: actorId || null,
    });
  } catch (error) {
    console.error("[notifyPayment] failed:", error.message);
    return null;
  }
};

/* ---------- CRUD ---------- */

const findPaymentById = async (id) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    throw new ApiError("Payment not found.", 404);
  }
  return payment;
};

const createPayment = async (data, recordedBy) => {
  const paymentData = pick(data, [
    "subscriptionId",
    "studentId",
    "groupId",
    "cycleStart",
    "cycleEnd",
    "amountDue",
    "amountPaid",
    "recordedBy",
  ]);

  if (recordedBy) {
    paymentData.recordedBy = recordedBy;
  }

  const payment = await Payment.create(paymentData);
  await notifyPayment(payment, "created", recordedBy);

  return payment;
};

const listPayments = async (query) => {
  const filter = {};

  if (query.studentId) filter.studentId = query.studentId;
  if (query.groupId) filter.groupId = query.groupId;
  if (query.status) filter.status = query.status;

  if (query.cycleStart || query.cycleEnd) {
    filter.$and = [];
    if (query.cycleStart) {
      filter.$and.push({ cycleEnd: { $gte: new Date(query.cycleStart) } });
    }
    if (query.cycleEnd) {
      filter.$and.push({ cycleStart: { $lte: new Date(query.cycleEnd) } });
    }
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ cycleStart: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    total,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
};

const updatePayment = async (id, data) => {
  const payment = await findPaymentById(id);

  if (payment.status === "paid") {
    throw new ApiError("Paid payments cannot be edited.", 400);
  }

  Object.assign(
    payment,
    pick(data, ["subscriptionId", "cycleStart", "cycleEnd", "amountDue"])
  );

  await payment.save();
  return payment;
};

const recordPayment = async (id, amount, recordedBy) => {
  const payment = await findPaymentById(id);

  if (payment.status === "paid") {
    throw new ApiError("This payment has already been fully paid.", 400);
  }

  const nextAmountPaid = roundCurrency(payment.amountPaid + amount);
  if (nextAmountPaid > payment.amountDue) {
    throw new ApiError("Payment amount exceeds the remaining balance.", 400);
  }

  payment.amountPaid = nextAmountPaid;
  if (recordedBy) {
    payment.recordedBy = recordedBy;
  }

  await payment.save();
  await notifyPayment(payment, payment.status, recordedBy);

  return payment;
};

module.exports = {
  createPayment,
  listPayments,
  findPaymentById,
  updatePayment,
  recordPayment,
};