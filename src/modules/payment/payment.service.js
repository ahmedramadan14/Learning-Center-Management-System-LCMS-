const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiErrors");
const Notification = require("../notification/notification.model");
const Student = require("../student/student.model");
const Group = require("../group/group.model");
const Payment = require("./payment.model");
const Teacher = require("../teacher/teacher.model");
const Secretary = require("../secretaries/secretary.model"); 
const Parent = require("../parent/parent.model"); 

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const pick = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
    return result;
  }, {});

const getStaffAssociatedTeacherId = async (user) => {
  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id || user.id });
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    return teacher._id;
  } else if (user.role === "secretary") {
    const secretary = await Secretary.findOne({ userId: user._id || user.id });
    if (!secretary || !secretary.teacher) {
      throw new ApiError("Secretary is not linked to any valid teacher", 400);
    }
    return secretary.teacher;
  }
  return null;
};

const verifyGroupAccess = async (groupId, user) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError("Group not found.", 404);

  if (user.role === "admin") return group;

  const teacherId = await getStaffAssociatedTeacherId(user);

  if (!teacherId || group.teacherId.toString() !== teacherId.toString()) {
    throw new ApiError("Not authorized to manage payments for this group.", 403);
  }

  return group;
};

/* ---------- Payment Notifications ---------- */

const paymentMessage = (event, payment) => {
  const amount = roundCurrency(payment.amountDue);
  const paid = roundCurrency(payment.amountPaid);
  const remaining = roundCurrency(payment.remaining);

  switch (event) {
    case "created":
      return {
        title: "دفعة حصة جديدة",
        body: `تم تسجيل حصة بقيمة ${amount}. المتبقي: ${remaining}.`,
      };
    case "partial":
      return {
        title: "دفعة جزئية للحصة",
        body: `تم استلام ${paid}. المتبقي: ${remaining}.`,
      };
    case "paid":
      return {
        title: "تم دفع الحصة بالكامل",
        body: `تم سداد مبلغ الحصة (${amount}) بالكامل. شكراً لك!`,
      };
    default:
      return {
        title: "تحديث حالة الدفع",
        body: `حالة الدفع الآن: ${payment.status}.`,
      };
  }
};

const getPaymentAudience = async (studentId) => {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;

  const userIds = new Set();
  if (student.userId) userIds.add(student.userId.toString());

  const parents = await Parent.find({ students: studentId }).lean();

  let hasParents = false;
  parents.forEach((p) => {
    if (p.user) {
      userIds.add(p.user.toString());
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

/* ---------- CRUD Services ---------- */

const findPaymentById = async (id, user) => {
  const payment = await Payment.findById(id).populate("groupId");
  if (!payment) {
    throw new ApiError("Payment not found.", 404);
  }

  if (user) {
    await verifyGroupAccess(payment.groupId._id || payment.groupId, user);
  }

  return payment;
};

const createPayment = async (data, user) => {
  const paymentData = pick(data, [
    "studentId",
    "groupId",
    "sessionDate",
    "sessionNumber",
    "amountDue",
    "amountPaid",
  ]);

  const group = await verifyGroupAccess(paymentData.groupId, user);

  const student = await Student.findById(paymentData.studentId);
  if (!student) throw new ApiError("Student not found.", 404);

  if (paymentData.amountDue === undefined) {
    if (group.sessionPrice === undefined) {
      throw new ApiError("Session price for this group is not set.", 400);
    }
    paymentData.amountDue = group.sessionPrice;
  }

  if (paymentData.amountPaid === undefined) {
    paymentData.amountPaid = paymentData.amountDue;
  }

  paymentData.recordedBy = user._id || user.id;

  const payment = await Payment.create(paymentData);
  await notifyPayment(payment, "created", user._id || user.id);

  return payment;
};

const createPaymentByCode = async (data, user) => {
  const { studentCode, groupId, amountPaid, amountDue, sessionDate, sessionNumber } = data;

  const group = await verifyGroupAccess(groupId, user);

  const student = await Student.findOne({ studentCode, isActive: true });
  if (!student) {
    throw new ApiError("Student not found with this code", 404);
  }

  const isEnrolled = Array.isArray(student.groups) &&
    student.groups.some((gId) => gId.toString() === groupId.toString());

  if (!isEnrolled) {
    throw new ApiError("This student is not enrolled in this group.", 400);
  }

  const finalAmountDue =
    amountDue !== undefined ? Number(amountDue) : group.sessionPrice;

  if (finalAmountDue === undefined || finalAmountDue === null) {
    throw new ApiError("Session price is not defined for this group.", 400);
  }

  const finalAmountPaid =
    amountPaid !== undefined ? Number(amountPaid) : finalAmountDue;

  const recordedBy = user._id || user.id;

  const payment = await Payment.create({
    studentId: student._id,
    groupId: group._id,
    sessionDate: sessionDate ? new Date(sessionDate) : new Date(),
    sessionNumber,
    amountDue: finalAmountDue,
    amountPaid: finalAmountPaid,
    recordedBy,
  });

  await notifyPayment(payment, "created", recordedBy);

  return payment;
};

const listPayments = async (query, user) => {
  let filter = {};

  if (user.role === "teacher" || user.role === "secretary") {
    const teacherId = await getStaffAssociatedTeacherId(user);
    if (!teacherId) return { payments: [], total: 0, page: 1, limit: 20, pages: 1 };

    const teacherGroups = await Group.find({ teacherId }).select("_id");
    const groupIds = teacherGroups.map((g) => g._id);
    filter.groupId = { $in: groupIds };
  } 
  else if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id || user.id });
    if (!student) return { payments: [], total: 0, page: 1, limit: 20, pages: 1 };
    filter.studentId = student._id;
  } 
  else if (user.role === "parent") {
    const parent = await Parent.findOne({ user: user._id || user.id });
    if (!parent || !parent.students || parent.students.length === 0) {
      return { payments: [], total: 0, page: 1, limit: 20, pages: 1 };
    }
    filter.studentId = { $in: parent.students };
  }

  if (query.studentId) filter.studentId = query.studentId;
  if (query.groupId) {
    if (filter.groupId && filter.groupId.$in) {
      const isAllowed = filter.groupId.$in.some((id) => id.toString() === query.groupId);
      if (!isAllowed) throw new ApiError("Not authorized to view payments for this group", 403);
    }
    filter.groupId = query.groupId;
  }
  if (query.status) filter.status = query.status;

  if (query.sessionDate) {
    const startOfDay = new Date(query.sessionDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(query.sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    filter.sessionDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("studentId", "studentCode")
      .populate("groupId", "groupName")
      .sort({ sessionDate: -1, createdAt: -1 })
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

const updatePayment = async (id, data, user) => {
  const payment = await findPaymentById(id, user);

  if (payment.status === "paid") {
    throw new ApiError("Paid payments cannot be edited.", 400);
  }

  Object.assign(
    payment,
    pick(data, ["sessionDate", "sessionNumber", "amountDue"])
  );

  await payment.save();
  return payment;
};

const recordPayment = async (id, amount, user) => {
  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError("Amount must be a positive number.", 400);
  }

  const payment = await findPaymentById(id, user);

  if (payment.status === "paid") {
    throw new ApiError("This payment has already been fully paid.", 400);
  }

  const nextAmountPaid = roundCurrency(payment.amountPaid + amount);
  if (nextAmountPaid > payment.amountDue) {
    throw new ApiError("Payment amount exceeds the remaining balance.", 400);
  }

  const recordedBy = user._id || user.id;
  payment.amountPaid = nextAmountPaid;
  payment.recordedBy = recordedBy;

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
  createPaymentByCode,
};