const mongoose = require("mongoose");

const ApiError = require("../../utils/ApiErrors");
const Notification = require("./notification.model");
const NotificationReadReceipt = require("./notificationReadReceipt.model");
const Group = require("../group/group.model");
const Parent = require("../parent/parent.model");
const ParentStudent = require("../ParentStudent/parentStudent.model");
const Secretary = require("../secretaries/secretary.model");
const Student = require("../student/student.model");
const Teacher = require("../teacher/teacher.model");

const pick = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }

    return result;
  }, {});

const getUserId = (user) => {
  const value = user?._id || user?.id;

  if (!value || !mongoose.isValidObjectId(value)) {
    throw new ApiError("A valid authenticated user is required.", 401);
  }

  return new mongoose.Types.ObjectId(value);
};

const isAdmin = (user) => user?.role === "admin";

const roleTargets = (role) => {
  const legacyRoleNames = {
    student: "students",
    teacher: "teachers",
    parent: "parents",
  };

  return ["all", role, legacyRoleNames[role]].filter(Boolean);
};

const getStaffTeacherId = async (user) => {
  const userId = getUserId(user);

  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId }).select("_id");
    if (!teacher) throw new ApiError("Teacher profile not found", 404);
    return teacher._id;
  }

  if (user.role === "secretary") {
    const secretary = await Secretary.findOne({ userId }).select("teacher");
    if (!secretary?.teacher) {
      throw new ApiError("Secretary is not linked to a teacher", 403);
    }
    return secretary.teacher;
  }

  return null;
};

const getStaffAudience = async (user) => {
  const teacherId = await getStaffTeacherId(user);
  const groups = await Group.find({ teacherId }).select("_id");
  const groupIds = groups.map((group) => group._id);
  const students = await Student.find({
    $or: [{ teacher: teacherId }, { groups: { $in: groupIds } }],
  }).select("_id userId");

  const studentIds = students.map((student) => student._id);
  const studentUserIds = students
    .map((student) => student.userId)
    .filter(Boolean)
    .map((id) => id.toString());

  const parentIds = studentIds.length > 0
    ? await ParentStudent.distinct("parent", { student: { $in: studentIds } })
    : [];
  const parents = parentIds.length > 0
    ? await Parent.find({ _id: { $in: parentIds } }).select("user")
    : [];
  const parentUserIds = parents
    .map((parent) => parent.user)
    .filter(Boolean)
    .map((id) => id.toString());

  return {
    students: new Set(studentUserIds),
    parents: new Set(parentUserIds),
  };
};

const toStringSet = (values = []) =>
  new Set(values.filter(Boolean).map((value) => value.toString()));

/**
 * Staff notifications are always resolved to explicit user ids. A role-wide
 * notification from one teacher would otherwise reach every student/parent in
 * the centre, including users outside that teacher's scope.
 */
const enforceStaffNotificationAudience = async (data, user) => {
  if (isAdmin(user)) return data;

  const requestedRole = data.targetRole;
  const directTargets = toStringSet(data.targetUserIds);
  if (!requestedRole && directTargets.size === 0) {
    throw new ApiError("Choose a student or parent audience for this notification.", 400);
  }

  const audience = await getStaffAudience(user);
  const recipients = new Set();

  if (requestedRole === "student" || requestedRole === "students") {
    audience.students.forEach((id) => recipients.add(id));
  } else if (requestedRole === "parent" || requestedRole === "parents") {
    audience.parents.forEach((id) => recipients.add(id));
  } else if (requestedRole !== undefined && requestedRole !== "direct") {
    throw new ApiError(
      "Staff can only notify their own students or the parents linked to those students.",
      403
    );
  }

  const authorizedIds = new Set([...audience.students, ...audience.parents]);
  for (const targetId of directTargets) {
    if (!authorizedIds.has(targetId)) {
      throw new ApiError("You are not authorized to notify one or more selected users.", 403);
    }
    recipients.add(targetId);
  }

  if (recipients.size === 0) {
    throw new ApiError("There are no matching recipients in your assigned scope.", 400);
  }

  return {
    ...data,
    targetRole: "direct",
    targetUserIds: [...recipients],
  };
};

/**
 * Notifications with one or more explicit targets are direct delivery only.
 * This is intentionally stronger than targetRole: it protects legacy payment
 * notifications that contain both a plural role and explicit recipient ids.
 */
const normalizeDirectAudience = (data) => {
  if (Array.isArray(data.targetUserIds) && data.targetUserIds.length > 0) {
    return { ...data, targetRole: "direct" };
  }

  return data;
};

const roleAudienceFilter = (role) => ({
  targetRole: { $in: roleTargets(role) },
  $or: [
    { targetUserIds: { $exists: false } },
    { targetUserIds: { $size: 0 } },
  ],
});

const notificationAccessFilter = (user) => {
  const userId = getUserId(user);
  if (isAdmin(user)) return {};

  return {
    $or: [
      // Direct recipient, including legacy records that also have targetRole.
      { targetUserIds: userId },
      // Role broadcasts must not have explicit recipient ids.
      roleAudienceFilter(user.role),
      // Staff may review notifications they have sent without exposing their
      // target lists to other non-admin users.
      { createdBy: userId },
    ],
  };
};

const findNotificationById = async (id, user) => {
  const notification = await Notification.findOne({
    _id: id,
    ...notificationAccessFilter(user),
  });

  if (!notification) {
    throw new ApiError("Notification not found.", 404);
  }

  return notification;
};

const notificationId = (notification) => notification._id || notification.id;

const serializeNotification = (notification, user, isRead = false) => {
  const source = notification.toObject ? notification.toObject() : notification;
  const id = notificationId(source);
  const serialized = {
    _id: id,
    id: id?.toString(),
    title: source.title,
    body: source.body,
    type: source.type,
    targetRole: source.targetRole,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    isRead: Boolean(isRead),
  };

  // Recipient responses deliberately omit targetUserIds, createdBy and every
  // other user's receipt. Those values are only useful to an administrator
  // managing announcements and would reveal private relationships otherwise.
  if (isAdmin(user)) {
    serialized.targetUserIds = source.targetUserIds || [];
    serialized.createdBy = source.createdBy || null;
  }

  return serialized;
};

const readIdsForNotifications = async (userId, ids) => {
  if (ids.length === 0) return new Set();

  const receipts = await NotificationReadReceipt.find({
    user: userId,
    notification: { $in: ids },
  })
    .select("notification")
    .lean();

  return new Set(receipts.map((receipt) => receipt.notification.toString()));
};

const countUnreadNotifications = async (filter, userId) => {
  const [result] = await Notification.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: NotificationReadReceipt.collection.name,
        let: { notificationId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$notification", "$$notificationId"] },
                  { $eq: ["$user", userId] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "currentUserReceipt",
      },
    },
    { $match: { "currentUserReceipt.0": { $exists: false } } },
    { $count: "total" },
  ]);

  return result?.total || 0;
};

const createReadReceipt = async (notification, userId) => {
  try {
    await NotificationReadReceipt.updateOne(
      { notification: notificationId(notification), user: userId },
      { $setOnInsert: { readAt: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    // Concurrent reads can race on the unique index. In that case the receipt
    // already exists and the desired state has been reached.
    if (error?.code !== 11000) throw error;
  }
};

const createNotification = async (data, createdBy, currentUser) => {
  const actorId = getUserId(currentUser);
  const scopedData = await enforceStaffNotificationAudience(data, currentUser);
  const notificationData = pick(normalizeDirectAudience(scopedData), [
    "title",
    "body",
    "type",
    "targetRole",
    "targetUserIds",
  ]);

  // The authenticated user is the sole authoritative author. Clients cannot
  // impersonate another sender through a request body field.
  notificationData.createdBy = actorId;

  const notification = await Notification.create(notificationData);
  // An author has necessarily seen the notification they just composed.
  await createReadReceipt(notification, actorId);

  return notification;
};

const listNotifications = async (query, user) => {
  const userId = getUserId(user);
  const filter = notificationAccessFilter(user);

  if (query.type) {
    filter.type = query.type;
  }

  if (query.targetRole) {
    filter.targetRole = query.targetRole;
  }

  if (query.targetUserId) {
    filter.targetUserIds = new mongoose.Types.ObjectId(query.targetUserId);
  }

  if (query.createdBy) {
    filter.createdBy = new mongoose.Types.ObjectId(query.createdBy);
  }

  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    countUnreadNotifications(filter, userId),
  ]);
  const ids = notifications.map((notification) => notificationId(notification));
  const readIds = await readIdsForNotifications(userId, ids);

  return {
    notifications: notifications.map((notification) =>
      serializeNotification(notification, user, readIds.has(notificationId(notification).toString()))
    ),
    total,
    unreadCount,
    page,
    limit,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
};

const getNotificationForUser = async (id, user) => {
  const userId = getUserId(user);
  const notification = await findNotificationById(id, user);
  const readReceipt = await NotificationReadReceipt.exists({
    notification: notificationId(notification),
    user: userId,
  });

  return serializeNotification(notification, user, Boolean(readReceipt));
};

const markNotificationRead = async (id, user) => {
  const userId = getUserId(user);
  const notification = await findNotificationById(id, user);
  await createReadReceipt(notification, userId);

  return serializeNotification(notification, user, true);
};

const markAllNotificationsRead = async (user) => {
  const userId = getUserId(user);
  const ids = await Notification.distinct("_id", notificationAccessFilter(user));

  if (ids.length === 0) {
    return { matched: 0, markedRead: 0 };
  }

  const now = new Date();
  let result;

  try {
    result = await NotificationReadReceipt.bulkWrite(
      ids.map((id) => ({
        updateOne: {
          filter: { notification: id, user: userId },
          update: { $setOnInsert: { readAt: now } },
          upsert: true,
        },
      })),
      { ordered: false }
    );
  } catch (error) {
    const rawWriteErrors = error?.writeErrors;
    let writeErrors = [];

    if (Array.isArray(rawWriteErrors)) {
      writeErrors = rawWriteErrors;
    } else if (rawWriteErrors) {
      writeErrors = Object.values(rawWriteErrors);
    } else if (error?.code === 11000) {
      writeErrors = [error];
    }
    // Two browser sessions can mark the same set concurrently. Duplicate-key
    // errors mean another request already created the exact receipts, so the
    // requested final state is still correct.
    if (writeErrors.length === 0 || writeErrors.some((writeError) => writeError.code !== 11000)) {
      throw error;
    }
    result = error.result;
  }

  return {
    matched: ids.length,
    markedRead: result.upsertedCount || result.result?.nUpserted || 0,
  };
};

const updateNotification = async (id, data, user) => {
  const notification = await findNotificationById(id, user);
  const previousNotification = notification.toObject();
  const requestedData = pick(data, ["title", "body", "type", "targetRole", "targetUserIds"]);
  const hasExistingDirectRecipients =
    requestedData.targetUserIds === undefined &&
    Array.isArray(notification.targetUserIds) &&
    notification.targetUserIds.length > 0;
  const nextData = hasExistingDirectRecipients
    ? { ...requestedData, targetRole: "direct" }
    : normalizeDirectAudience(requestedData);
  const nextTargetRole = nextData.targetRole ?? notification.targetRole;
  const nextTargetUserIds = nextData.targetUserIds ?? notification.targetUserIds;

  if (nextTargetRole === "direct" && (!Array.isArray(nextTargetUserIds) || nextTargetUserIds.length === 0)) {
    throw new ApiError("targetRole direct requires at least one targetUserId.", 400);
  }

  Object.assign(notification, nextData);
  await notification.save();

  return { notification, previousNotification };
};

const deleteNotification = async (id, user) => {
  const notification = await findNotificationById(id, user);
  await Promise.all([
    notification.deleteOne(),
    NotificationReadReceipt.deleteMany({ notification: notificationId(notification) }),
  ]);

  return notification;
};

module.exports = {
  createNotification,
  listNotifications,
  findNotificationById,
  getNotificationForUser,
  markNotificationRead,
  markAllNotificationsRead,
  updateNotification,
  deleteNotification,
  serializeNotification,
  notificationAccessFilter,
  getUserId,
};
