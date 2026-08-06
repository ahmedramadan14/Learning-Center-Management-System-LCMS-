const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiErrors");
const Payment = require("./payment.model");
const Notification = require("../notification/notification.model");

// Round money to 2 decimal places to avoid floating point issues
const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Pick only allowed fields from the request body
const pick = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
    return result;
  }, {});

/* ---------- Payment notifications ---------- */

// Simple message for each payment event
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
    case "waived":
      return {
        title: "Payment waived",
        body: `The payment was waived. Reason: ${payment.waivedReason || "-"}.`,
      };
    default:
      return {
        title: "Payment updated",
        body: `Payment status is now: ${payment.status}.`,
      };
  }
};

// Find who should receive the notification (student user + parent users).
// Returns null if the Student model is not registered yet (team still working on it).
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

// Create a payment notification (best effort: never breaks the payment flow)
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
    // Log only: a notification failure must not fail the payment request
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
  // Fixed: no trailing spaces in field names
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

  // Send "new payment" notification
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

  if (["paid", "waived"].includes(payment.status)) {
    throw new ApiError("Paid or waived payments cannot be edited.", 400);
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

  if (payment.status === "waived") {
    throw new ApiError("A waived payment cannot receive additional payments.", 400);
  }
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

  // Send "partial" or "paid" notification based on the new status
  await notifyPayment(payment, payment.status, recordedBy);

  return payment;
};

const waivePayment = async (id, waivedBy, waivedReason) => {
  const payment = await findPaymentById(id);

  if (payment.status === "paid") {
    throw new ApiError("A fully paid payment cannot be waived.", 400);
  }
  if (payment.status === "waived") {
    throw new ApiError("This payment has already been waived.", 400);
  }

  payment.status = "waived";
  payment.waivedBy = waivedBy;
  payment.waivedReason = waivedReason;

  await payment.save();

  // Send "waived" notification
  await notifyPayment(payment, "waived", waivedBy);

  return payment;
};

module.exports = {
  createPayment,
  listPayments,
  findPaymentById,
  updatePayment,
  recordPayment,
  waivePayment,
};