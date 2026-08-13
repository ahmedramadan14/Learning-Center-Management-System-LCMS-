const ApiError = require("../utils/ApiErrors");
const Secretary = require("../modules/secretaries/secretary.model");

module.exports = (...permissions) => async (req, res, next) => {
  if (req.user.role !== "secretary") return next();
  try {
    // Older database records may use `user` rather than `userId`.  Do not
    // block a legitimate secretary because their profile predates this schema.
    const secretary = await Secretary.findOne({
      $or: [{ userId: req.user._id }, { user: req.user._id }],
    }).lean();
    // Accept legacy values such as "manage_parents" and casing differences,
    // while storing/using the canonical module names in new records.
    const aliases = {
      parent: "parents", manageparents: "parents", manageparent: "parents",
      student: "students", managestudents: "students",
      group: "groups", managegroups: "groups",
      attendance: "attendance", manageattendance: "attendance",
      payment: "payments", managepayments: "payments",
      schedule: "schedule", manageschedule: "schedule",
      exam: "exams", manageexams: "exams",
      result: "results", manageresults: "results",
      grade: "grades", managegrades: "grades",
      report: "reports", viewreports: "reports",
    };
    const normalize = (value) => {
      const compact = String(value || "").toLowerCase().replace(/[^a-z]/g, "");
      return aliases[compact] || compact;
    };
    // Existing secretaries were created before per-module permissions existed.
    // An empty/missing permission list means operational secretary access. New
    // profiles can still be restricted by supplying an explicit permission list.
    if (!secretary) return next();
    const rawPermissions = [...(secretary.permissions || []), ...(secretary.permission || [])];
    if (rawPermissions.length === 0) return next();
    const granted = rawPermissions.map(normalize);
    if (!permissions.some((permission) => granted.includes(normalize(permission)))) {
      return next(new ApiError("You do not have permission to perform this action", 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};
