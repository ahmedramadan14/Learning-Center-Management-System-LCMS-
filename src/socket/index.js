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
  const rooms = [`user:${user._id.toString()}`, "targetRole:all"];
  const roleRoom = ROLE_TO_ROOM[user.role];

  if (roleRoom) {
    rooms.push(roleRoom);
  }

  return rooms;
};

const buildNotificationRooms = (notification) => {
  const rooms = new Set();

  if (notification?.targetRole) {
    rooms.add(`targetRole:${notification.targetRole}`);
  }

  if (Array.isArray(notification?.targetUserIds)) {
    for (const targetUserId of notification.targetUserIds) {
      if (targetUserId) {
        rooms.add(`user:${targetUserId.toString()}`);
      }
    }
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

const emitNotificationCreated = (notification) => {
  const rooms = buildNotificationRooms(notification);
  const broadcaster = buildBroadcastOperator(rooms);

  if (!broadcaster) {
    return;
  }

  broadcaster.emit("notification:created", { notification });
};

const emitNotificationUpdated = (notification, previousNotification) => {
  const rooms = [
    ...new Set([
      ...buildNotificationRooms(previousNotification),
      ...buildNotificationRooms(notification),
    ]),
  ];
  const broadcaster = buildBroadcastOperator(rooms);

  if (!broadcaster) {
    return;
  }

  broadcaster.emit("notification:updated", {
    notification,
    previousNotification,
  });
};

const emitNotificationDeleted = (notification) => {
  const rooms = buildNotificationRooms(notification);
  const broadcaster = buildBroadcastOperator(rooms);

  if (!broadcaster) {
    return;
  }

  broadcaster.emit("notification:deleted", {
    notificationId: notification._id?.toString() || notification.id,
    notification,
  });
};

const emitPaymentEvent = (eventName, payload, audience) => {
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

      if (!user.isApproved) {
        return next(new Error("User is not approved yet."));
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
  emitPaymentEvent,
};
