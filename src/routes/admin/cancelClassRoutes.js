const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  cancelClassSession,
  getCancelledSessions,
} = require("../../controllers/admin/classSchedule/cancelClassController");

// ✅ Cancel a session for a specific class
router.post("/:classScheduleId", authMiddleware, cancelClassSession);

// ✅ Get all cancelled sessions for a specific class
router.get("/:classScheduleId/cancelled", authMiddleware, getCancelledSessions);

module.exports = router;
