const ApiError = require("../../utils/ApiErrors");
const Payment = require("./payment.model");
const { emitNotificationCreated, emitPaymentEvent } = require("../../socket");
const { createNotification } = require("../notification/notification.service");
const Student = require("../student/student.model");
const Group = require("../group/group.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");

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

// Resolve student + parents separately so each role gets a correctly-targeted notification.
const getPaymentAudience = async (studentId) => {
  const student = await Student.findById(studentId).select("userId").lean();
  if (!student) {
    return null;
  }

  const studentUserIds = new Set();
  if (student.userId) {
    studentUserIds.add(student.userId.toString());
  }

  const links = await ParentStudent.find({ student: studentId })
    .populate("parent", "user")
    .lean();

  const parentUserIds = new Set();

  for (const link of links) {
    if (link.parent && link.parent.user) {
      parentUserIds.add(link.parent.user.toString());
    }
  }

  return {
    studentUserIds: [...studentUserIds],
    parentUserIds: [...parentUserIds],
    allUserIds: [...new Set([...studentUserIds, ...parentUserIds])],
  };
};

const notifyPayment = async (payment, event, actorId) => {
  try {
    const audience = await getPaymentAudience(payment.studentId);
    if (!audience || audience.allUserIds.length === 0) {
      return [];
    }

    const { title, body } = paymentMessage(event, payment);
    const notifications = [];

    if (audience.studentUserIds.length > 0) {
      const studentNotification = await createNotification(
        {
          title,
          body,
          type: "payment",
          targetRole: "students",
          targetUserIds: audience.studentUserIds,
        },
        actorId
      );

      emitNotificationCreated(studentNotification);
      notifications.push(studentNotification);
    }

    if (audience.parentUserIds.length > 0) {
      const parentNotification = await createNotification(
        {
          title,
          body,
          type: "payment",
          targetRole: "parents",
          targetUserIds: audience.parentUserIds,
        },
        actorId
      );

      emitNotificationCreated(parentNotification);
      notifications.push(parentNotification);
    }

    return {
      audience,
      notifications,
    };
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
  ]);

  const student = await Student.findById(paymentData.studentId);
  if (!student) {
    throw new ApiError("Student not found.", 404);
  }

  const group = await Group.findById(paymentData.groupId);
  if (!group) {
    throw new ApiError("Group not found.", 404);
  }

  // recordedBy always comes from the authenticated actor, never from the client body
  paymentData.recordedBy = recordedBy;

  const payment = await Payment.create(paymentData);
  const notificationResult = await notifyPayment(payment, "created", recordedBy);

  if (notificationResult?.audience) {
    emitPaymentEvent(
      "payment:created",
      {
        payment,
        notifications: notificationResult.notifications,
      },
      {
        targetRole: "all",
        targetUserIds: notificationResult.audience.allUserIds,
      }
    );
  }

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
  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError("Amount must be a positive number.", 400);
  }

  const payment = await findPaymentById(id);

  if (payment.status === "paid") {
    throw new ApiError("This payment has already been fully paid.", 400);
  }

  const nextAmountPaid = roundCurrency(payment.amountPaid + amount);
  if (nextAmountPaid > payment.amountDue) {
    throw new ApiError("Payment amount exceeds the remaining balance.", 400);
  }

  payment.amountPaid = nextAmountPaid;
  payment.recordedBy = recordedBy;

  await payment.save();
  const notificationResult = await notifyPayment(payment, payment.status, recordedBy);

  if (notificationResult?.audience) {
    emitPaymentEvent(
      "payment:recorded",
      {
        payment,
        notifications: notificationResult.notifications,
      },
      {
        targetRole: "all",
        targetUserIds: notificationResult.audience.allUserIds,
      }
    );
  }

  return payment;
};

const recordPaymentByCode = async (studentCode, groupId, amount, recordedBy) => {
  const student = await Student.findOne({ studentCode });

  if (!student) {
    throw new ApiError("Student not found.", 404);
  }

  const payment = await Payment.findOne({
    studentId: student._id,
    groupId,
    status: { $in: ["unpaid", "partial"] },
  }).sort({ cycleStart: -1 });

  if (!payment) {
    throw new ApiError(
      "Payment not found for this student and group.",
      404
    );
  }

  return recordPayment(payment._id, amount, recordedBy);
};
module.exports = {
  createPayment,
  listPayments,
  findPaymentById,
  updatePayment,
  recordPayment,
  recordPaymentByCode,
};
