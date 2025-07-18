const { validateFormData } = require("../../../utils/validateFormData");
const SessionPlanGroupService = require("../../../services/admin/sessionPlan/sessionPlanGroup");
const { logActivity } = require("../../../utils/admin/activityLogger");
const path = require("path");
// const { saveFile, deleteFile } = require("../../../utils/fileHandler");
const { saveFile, deleteFile } = require("../../../utils/fileHandler");

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

  // ✅ Parse levels JSON safely
  let parsedLevels;
  try {
    parsedLevels = typeof levels === "string" ? JSON.parse(levels) : levels;
  } catch (err) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid JSON for levels" });
  }

  // ✅ Prepare paths for uploaded files
  let bannerUrl = null;
  let videoUrl = null;

  try {
    const baseUploadDir = path.join(
      process.cwd(),
      "uploads",
      "session-plan-groups"
    );

    if (files.banner?.length > 0) {
      const bannerFile = files.banner[0];
      const bannerExt = path.extname(bannerFile.originalname).toLowerCase();
      const bannerName = `${Date.now()}_${Math.floor(
        Math.random() * 1e9
      )}${bannerExt}`;
      const bannerFullPath = path.join(baseUploadDir, bannerName);

      await saveFile(bannerFile, bannerFullPath);
      bannerUrl = `uploads/session-plan-groups/${bannerName}`;
      if (DEBUG) console.log("✅ Banner saved:", bannerUrl);
    }

    if (files.video?.length > 0) {
      const videoFile = files.video[0];
      const videoExt = path.extname(videoFile.originalname).toLowerCase();
      const videoName = `${Date.now()}_${Math.floor(
        Math.random() * 1e9
      )}${videoExt}`;
      const videoFullPath = path.join(baseUploadDir, videoName);

      await saveFile(videoFile, videoFullPath);
      videoUrl = `uploads/session-plan-groups/${videoName}`;
      if (DEBUG) console.log("✅ Video saved:", videoUrl);
    }
  } catch (fileErr) {
    console.error("❌ File save error:", fileErr);
    return res
      .status(500)
      .json({ status: false, message: "Failed to save banner/video" });
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

  // ✅ Parse levels JSON safely
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
    // ✅ Call service → Let service handle saving banner/video
    const result = await SessionPlanGroupService.updateSessionPlanGroup(
      id,
      { groupName, levels: parsedLevels },
      files
    );

    if (!result.status) {
      if (DEBUG) console.log("⚠️ Update failed:", result.message);
      return res.status(404).json(result);
    }

    const updated = result.data;

    const responseData = {
      groupName: updated.groupName,
      bannerUrl: updated.bannerUrl,
      videoUrl: updated.videoUrl,
      levels: updated.levels,
    };

    if (DEBUG) console.log("✅ Updated Session Plan Group:", responseData);

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
