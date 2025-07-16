const { validateFormData } = require("../../../utils/validateFormData");
const CancelSessionService = require("../../../services/admin/classSchedule/cancelClass");
const { logActivity } = require("../../../utils/admin/activityLogger");
const { ClassSchedule } = require("../../../models");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "class-session-cancel";

// ✅ CANCEL a class session
exports.cancelClassSession = async (req, res) => {
  const { classScheduleId } = req.params;
  const { cancelReason, creditMembers, notifyGroups } = req.body;

  if (DEBUG) {
    console.log("📥 Cancel request for classScheduleId:", classScheduleId);
    console.log("📥 Cancel data:", req.body);
  }

  // ✅ Validate required fields
  const validation = validateFormData(req.body, {
    requiredFields: ["cancelReason"], // At minimum, reason is required
  });

  if (!validation.isValid) {
    if (DEBUG) console.log("❌ Validation failed:", validation.error);
    await logActivity(req, PANEL, MODULE, "cancel", validation.error, false);
    return res.status(400).json({ status: false, ...validation });
  }

  // ✅ Check if class exists before cancelling
  const classSchedule = await ClassSchedule.findByPk(classScheduleId);
  if (!classSchedule) {
    if (DEBUG) console.log("❌ Class not found for ID:", classScheduleId);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "cancel",
      { message: "Class not found" },
      false
    );
    return res.status(404).json({
      status: false,
      message: "Invalid class selected. ClassSchedule does not exist.",
    });
  }

  try {
    // ✅ Call service to cancel session
    const result = await CancelSessionService.cancelSession(classScheduleId, {
      cancelReason,
      creditMembers,
      notifyGroups,
    });

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Cancel failed:", result.message);
      await logActivity(req, PANEL, MODULE, "cancel", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Session cancelled:", result.data);
    await logActivity(req, PANEL, MODULE, "cancel", result, true);

    return res.status(201).json({
      status: true,
      message: "Class session cancelled successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Server error during cancellation:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "cancel",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ GET all cancelled sessions for a class
exports.getCancelledSessions = async (req, res) => {
  const { classScheduleId } = req.params;
  if (DEBUG)
    console.log("📥 Fetching cancelled sessions for:", classScheduleId);

  try {
    const result = await CancelSessionService.getCancelledSessionsByClass(
      classScheduleId
    );

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Fetch failed:", result.message);
      await logActivity(req, PANEL, MODULE, "list", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG)
      console.table(
        result.data.map((s) => ({
          id: s.id,
          reason: s.cancelReason,
          date: s.cancelledAt,
        }))
      );

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      {
        oneLineMessage: `Fetched ${result.data.length} cancelled sessions for class ${classScheduleId}.`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Fetched cancelled sessions successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching cancelled sessions:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
