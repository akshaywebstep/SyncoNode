const { validateFormData } = require("../../../utils/validateFormData");
const SessionPlanGroupService = require("../../../services/admin/sessionPlan/sessionPlanGroup");
const { logActivity } = require("../../../utils/admin/activityLogger");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "session-plan-group";

// ✅ CREATE Session Plan Group
exports.createSessionPlanGroup = async (req, res) => {
  const { groupName, levels } = req.body;
  const files = req.files || {};

  if (DEBUG) {
    console.log("📥 Received request to create session plan group");
    console.log("📝 Form Data:", req.body);
    console.log("📎 Uploaded Files:", files);
  }

  // ✅ Validation
  const validation = validateFormData(req.body, {
    requiredFields: ["groupName", "levels"],
  });

  if (!validation.isValid) {
    if (DEBUG) console.log("❌ Validation failed:", validation.error);
    await logActivity(req, PANEL, MODULE, "create", validation.error, false);
    return res.status(400).json({ status: false, ...validation });
  }

  // ✅ Handle file paths
  const bannerUrl = files.banner ? `uploads/${files.banner[0].filename}` : null;
  const videoUrl = files.video ? `uploads/${files.video[0].filename}` : null;

  // ✅ Parse levels JSON safely
  let parsedLevels;
  try {
    parsedLevels = typeof levels === "string" ? JSON.parse(levels) : levels;
  } catch (err) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid JSON for levels" });
  }

  try {
    const result = await SessionPlanGroupService.createSessionPlanGroup({
      groupName,
      bannerUrl,
      videoUrl,
      levels: parsedLevels,
    });

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Creation failed:", result.message);
      await logActivity(req, PANEL, MODULE, "create", result, false);
      return res
        .status(400)
        .json({ status: false, message: result.message, data: result.data });
    }

    if (DEBUG) console.log("✅ Session Plan Group created:", result.data);
    await logActivity(req, PANEL, MODULE, "create", result, true);

    return res.status(201).json({
      status: true,
      message: "Session Plan Group created successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Server error during Session Plan Group creation:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "create",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ GET ALL Session Plan Groups
exports.getAllSessionPlanGroups = async (req, res) => {
  if (DEBUG) console.log("📥 Fetching all session plan groups...");

  try {
    const result = await SessionPlanGroupService.getAllSessionPlanGroups();

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Fetch failed:", result.message);
      await logActivity(req, PANEL, MODULE, "list", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) {
      console.log("✅ Session plan groups fetched successfully");
      console.table(result.data.map((g) => ({ id: g.id, name: g.groupName })));
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      { oneLineMessage: `Fetched ${result.data.length} session plan groups.` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Fetched session plan groups successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching session plan groups:", error);
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

// ✅ GET Session Plan Group by ID
exports.getSessionPlanGroupDetails = async (req, res) => {
  const { id } = req.params;
  if (DEBUG) console.log(`🔍 Fetching session plan group with ID: ${id}`);

  try {
    const result = await SessionPlanGroupService.getSessionPlanGroupById(id);

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Not found:", result.message);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Data fetched:", result.data);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "getById",
      { oneLineMessage: `Fetched group ID: ${id}` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Session Plan Group fetched successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error fetching session plan group:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ UPDATE Session Plan Group
exports.updateSessionPlanGroup = async (req, res) => {
  const { id } = req.params;
  const { groupName, levels } = req.body;
  const files = req.files || {};

  if (DEBUG) console.log(`✏️ Updating Session Plan Group ID: ${id}`, req.body);

  // ✅ File handling (ignored if not required)
  const bannerUrl = files.banner
    ? `uploads/${files.banner[0].filename}`
    : undefined;
  const videoUrl = files.video
    ? `uploads/${files.video[0].filename}`
    : undefined;

  // ✅ Parse levels JSON
  let parsedLevels;
  if (levels) {
    try {
      parsedLevels = typeof levels === "string" ? JSON.parse(levels) : levels;
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: "Invalid JSON format for levels",
      });
    }
  }

  try {
    const result = await SessionPlanGroupService.updateSessionPlanGroup(id, {
      groupName,
      bannerUrl,
      videoUrl,
      levels: parsedLevels,
    });

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Update failed:", result.message);
      return res.status(404).json(result);
    }

    const updated = result.data;

    // ✅ Extract only required fields
    const responseData = {
      groupName: updated.groupName,
      levels: updated.levels,
    };

    if (DEBUG) console.log("✅ Clean Response:", responseData);

    await logActivity(
      req,
      PANEL,
      MODULE,
      "update",
      { oneLineMessage: `Updated group ID: ${id}` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Session Plan Group updated successfully.",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Error updating session plan group:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "update",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

// ✅ DELETE Session Plan Group
exports.deleteSessionPlanGroup = async (req, res) => {
  const { id } = req.params;
  if (DEBUG) console.log(`🗑️ Deleting session plan group with ID: ${id}`);

  try {
    const result = await SessionPlanGroupService.deleteSessionPlanGroup(id);

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Delete failed:", result.message);
      return res.status(404).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log("✅ Session Plan Group deleted");
    await logActivity(
      req,
      PANEL,
      MODULE,
      "delete",
      { oneLineMessage: `Deleted group ID: ${id}` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Session Plan Group deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting session plan group:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "delete",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
