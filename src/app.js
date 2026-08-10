const express = require("express");
const cors = require("cors");
const qs = require("qs");

const ApiError = require("./utils/ApiErrors");
const globalError = require("./middlewares/errorHandler");

const userRoutes = require("./modules/user/user.route");
const studentRoutes = require("./modules/student/student.route");
const teacherRoutes = require("./modules/teacher/teacher.route");
const authRoutes = require("./modules/auth/auth.route");
const paymentRoutes = require("./modules/payment/payment.route");
const notificationRoutes = require("./modules/notification/notification.route");
const attendrouter = require("./modules/attendance/attendance.route.js");
const parentRoutes = require("./modules/parent/parent.route.js");
const ParentStudent = require("./modules/ParentStudent/parentStudent.route.js");
const secretarieRoutes = require("./modules/secretaries/secretary.route");
const gradeRoutes = require("./modules/grade/grade.route.js");
const groupRoutes = require("./modules/group/group.route.js");
const scheduleRoutes = require("./modules/schedule/schedule.route.js");
const examRoutes = require("./modules/exam/exam.route.js");
const resultRoutes = require("./modules/results/result.route.js");

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

app.set("query parser", (str) => qs.parse(str));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "LCMS API is running",
  });
});

// Routes
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/teachers", teacherRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/attendance", attendrouter);
app.use("/api/v1/parents", parentRoutes);
app.use("/api/v1/secretaries", secretarieRoutes);
app.use("/api/v1/parentstudent", ParentStudent);
app.use("/api/v1/grades", gradeRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/results", resultRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(globalError);

module.exports = app;