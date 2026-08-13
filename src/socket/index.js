const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const User = require("../modules/user/user.model");
const TokenBlacklist = require("../modules/tokenBlacklist/tokenBlacklist.model");

let io;

const ROLE_TO_ROOM = {
  student: "targetRole:students",
  parent: "targetRole:parents",
  teacher: "targetRole:teachers",
};

const getSocketCorsOrigin = () => {
  const rawOrigins = process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN;

  if (!rawOrigins) {
    return "*";
  }

  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length === 1 ? origins[0] : origins;
};

const normalizeToken = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.startsWith("Bearer ")
    ? trimmedValue.slice(7).trim()
    : trimmedValue;
};

const getHandshakeToken = (socket) =>
  normalizeToken(socket.handshake.auth?.token || socket.handshake.headers?.authorization);

const buildUserRooms = (user) => {
  const rooms = [
    `user:${user._id.toString()}`,
    "targetRole:all",
    `targetRole:${user.role}`,
  ];
  const roleRoom = ROLE_TO_ROOM[user.role];

  if (roleRoom) {
    rooms.push(roleRoom);
  }

  return rooms;
};

const buildNotificationRooms = (notification) => {
  const rooms = new Set();
  const directTargets = Array.isArray(notification?.targetUserIds)
    ? notification.targetUserIds.filter(Boolean)
    : [];

  // A notification addressed to explicit users is private even when old data
  // also contains a role value. This prevents a legacy role broadcast from
  // leaking a student's or parent's payment notification to every user with
  // the same role.
  if (directTargets.length === 0 && notification?.targetRole) {
    rooms.add(`targetRole:${notification.targetRole}`);
  }

  for (const targetUserId of directTargets) {
    rooms.add(`user:${targetUserId.toString()}`);
  }

  return [...rooms];
};

const buildAudienceRooms = (audience = {}) =>
  buildNotificationRooms({
    targetRole: audience.targetRole,
    targetUserIds: audience.targetUserIds,
  });

const buildBroadcastOperator = (rooms) => {
  if (!rooms.length) {
    return null;
  }

  return rooms.reduce((operator, room) => operator.to(room), getIo());
};

const emitToRooms = (rooms, eventName, payload) => {
  for (const room of rooms) {
    getIo().to(room).emit(eventName, payload);
  }
};

// Socket events can be delivered to several recipients at once. Never send
// target user ids, author ids, or receipt data in that shared payload.
const toClientNotification = (notification) => {
  const source = notification?.toObject ? notification.toObject() : notification || {};
  const id = source._id || source.id;

  return {
    _id: id,
    id: id?.toString(),
    title: source.title,
    body: source.body,
    type: source.type,
    targetRole: source.targetRole,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

const emitNotificationCreated = (notification) => {
  if (!io) {
    return;
  }

  const rooms = buildNotificationRooms(notification);
  const broadcaster = buildBroadcastOperator(rooms);

  if (!broadcaster) {
    return;
  }

  broadcaster.emit("notification:created", {
    notification: toClientNotification(notification),
  });
};

const emitNotificationUpdated = (notification, previousNotification) => {
  if (!io) {
    return;
  }

  const previousRooms = new Set(buildNotificationRooms(previousNotification));
  const nextRooms = new Set(buildNotificationRooms(notification));
  const removedRooms = [...previousRooms].filter((room) => !nextRooms.has(room));
  const addedRooms = [...nextRooms].filter((room) => !previousRooms.has(room));
  const retainedRooms = [...nextRooms].filter((room) => previousRooms.has(room));
  const previousNotificationId =
    previousNotification?._id?.toString() || previousNotification?.id;

  // Recipient changes must not reveal the updated content to users who have
  // been removed, nor historical content to newly added users. Express the
  // change as delete/create for those groups and only send an update to the
  // overlapping audience.
  if (removedRooms.length > 0 && previousNotificationId) {
    emitToRooms(removedRooms, "notification:deleted", {
      notificationId: previousNotificationId,
    });
  }

  if (addedRooms.length > 0) {
    emitToRooms(addedRooms, "notification:created", {
      notification: toClientNotification(notification),
    });
  }

  if (retainedRooms.length > 0) {
    emitToRooms(retainedRooms, "notification:updated", {
      notification: toClientNotification(notification),
    });
  }
};

const emitNotificationDeleted = (notification) => {
  if (!io) {
    return;
  }

  const rooms = buildNotificationRooms(notification);
  const broadcaster = buildBroadcastOperator(rooms);

  if (!broadcaster) {
    return;
  }

  broadcaster.emit("notification:deleted", {
    notificationId: notification._id?.toString() || notification.id,
    notification: toClientNotification(notification),
  });
};

const emitNotificationRead = ({ userId, notificationId, readAt }) => {
  if (!io || !userId || !notificationId) {
    return;
  }

  io.to(`user:${userId.toString()}`).emit("notification:read", {
    notificationId: notificationId.toString(),
    readAt,
  });
};

const emitNotificationsReadAll = ({ userId }) => {
  if (!io || !userId) {
    return;
  }

  io.to(`user:${userId.toString()}`).emit("notifications:read-all");
};

const emitPaymentEvent = (eventName, payload, audience) => {
  if (!io) {
    return;
  }

  const rooms = buildAudienceRooms(audience);
  const broadcaster = buildBroadcastOperator(rooms);

  if (!broadcaster) {
    return;
  }

  broadcaster.emit(eventName, payload);
};

const initializeSocket = (httpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: getSocketCorsOrigin(),
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getHandshakeToken(socket);

      if (!token) {
        return next(new Error("Authentication token is required."));
      }

      const isBlacklisted = await TokenBlacklist.findOne({ token }).lean();

      if (isBlacklisted) {
        return next(new Error("Invalid token."));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("User not found."));
      }

      if (!user.isApproved || !user.isActive) {
        return next(new Error("User is not allowed to connect."));
      }

      socket.data.token = token;
      socket.data.user = user;

      return next();
    } catch (error) {
      return next(new Error("Unauthorized socket connection."));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    socket.join(buildUserRooms(user));

    socket.emit("socket:ready", {
      userId: user._id.toString(),
      role: user.role,
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet.");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIo,
  emitNotificationCreated,
  emitNotificationUpdated,
  emitNotificationDeleted,
  emitNotificationRead,
  emitNotificationsReadAll,
  emitPaymentEvent,
};
