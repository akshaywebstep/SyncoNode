const path = require("path");
const { validateFormData } = require("../../../utils/validateFormData");
const { saveFile } = require("../../../utils/fileHandler");
const { logActivity } = require("../../../utils/admin/activityLogger");
const SessionPlanGroupService = require("../../../services/admin/sessionPlan/sessionPlanGroup");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "session-plan-group";

exports.createSessionPlanGroup = async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files || {};

    if (DEBUG) {
      console.log("📥 STEP 1: Received request to create session plan group");
      console.log("📝 Form Data:", formData);
      console.log("📎 Uploaded Files:", Object.keys(files));
    }

    // ✅ Step 2: Validate form data
    const validation = validateFormData(formData, {
      requiredFields: ["groupName", "level"],
      fileExtensionValidations: {
        banner: ["jpg", "jpeg", "png", "webp"],
        video: ["mp4", "mov", "mpeg"],
      },
    });

    if (!validation.isValid) {
      if (DEBUG) console.log("❌ Validation failed:", validation.error);
      await logActivity(req, PANEL, MODULE, "create", validation.error, false);
      return res.status(400).json({
        status: false,
        error: validation.error,
        message: validation.message,
      });
    }

    // ✅ Step 3: Prepare file paths
    const groupId = `grp_${Date.now()}`;
    let bannerUrl = "";
    let videoUrl = "";

    // ✅ Save banner file if present
    if (files.banner?.[0]) {
      const banner = files.banner[0];
      const ext = path.extname(banner.originalname).toLowerCase();
      const filename = `${Date.now()}_${Math.floor(Math.random() * 1e6)}${ext}`;
      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "sessionPlan",
        groupId,
        "banner",
        filename
      );
      bannerUrl = `uploads/sessionPlan/${groupId}/banner/${filename}`;
      await saveFile(banner, fullPath);
    }

    // ✅ Save video file if present
    if (files.video?.[0]) {
      const video = files.video[0];
      const ext = path.extname(video.originalname).toLowerCase();
      const filename = `${Date.now()}_${Math.floor(Math.random() * 1e6)}${ext}`;
      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "sessionPlan",
        groupId,
        "videos",
        filename
      );
      videoUrl = `uploads/sessionPlan/${groupId}/videos/${filename}`;
      await saveFile(video, fullPath);
    }

    // ✅ Step 4: Create session plan group via service
    const result = await SessionPlanGroupService.createSessionPlanGroup({
      groupName: formData.groupName,
      level: formData.level,
      player: formData.player || null,
      skillOfTheDay: formData.skillOfTheDay || null,
      description: formData.description || null,
      sessionExerciseId: formData.sessionExerciseId || null,
      bannerUrl,
      videoUrl,
    });

    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "create", result, false);
      return res.status(500).json(result);
    }

    // ✅ Step 5: Log and return success
    await logActivity(
      req,
      PANEL,
      MODULE,
      "create",
      {
        oneLineMessage: `Created session plan group "${formData.groupName}" [${formData.level}]`,
      },
      true
    );

    return res.status(201).json({
      status: true,
      message: "Session plan group created successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
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

exports.getSessionPlanGroups = async (req, res) => {
  if (DEBUG) console.log("📋 Request to list all session plan groups");

  try {
    const result = await SessionPlanGroupService.getSessionPlanGroups();

    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "list", result, false);
      return res.status(500).json(result);
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      {
        oneLineMessage: `Fetched ${result.data.length} group(s)`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Fetched session plan groups successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ List Groups Error:", error);
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

exports.getSessionPlanGroupById = async (req, res) => {
  const { id } = req.params;
  if (DEBUG) console.log("🔍 Fetching session plan group ID:", id);

  try {
    const result = await SessionPlanGroupService.getSessionPlanGroupById(id);

    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "getById", result, false);
      return res.status(404).json({ status: false, message: result.message });
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "getById",
      {
        oneLineMessage: `Fetched group ID: ${id}`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Fetched session plan group successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Fetch Group Error:", error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "getById",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

exports.updateSessionPlanGroup = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const files = req.files || {};

  if (DEBUG) {
    console.log("🛠️ Updating session plan group ID:", id);
    console.log("📝 Received form data:", formData);
    console.log("📎 Uploaded files:", Object.keys(files));
  }

  const validation = validateFormData(formData, {
    requiredFields: ["groupName", "level"],
    fileExtensionValidations: {
      banner: ["jpg", "jpeg", "png", "webp"],
      video: ["mp4", "mov", "mpeg"],
    },
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "update", validation, false);
    return res.status(400).json({ status: false, ...validation });
  }

  try {
    const updatePayload = {
      groupName: formData.groupName,
      level: formData.level,
      player: formData.player || null,
      skillOfTheDay: formData.skillOfTheDay || null,
      description: formData.description || null,
      sessionExerciseId: formData.sessionExerciseId || null,
    };

    // ✅ Handle banner upload if provided
    if (files.banner?.[0]) {
      const banner = files.banner[0];
      const ext = path.extname(banner.originalname).toLowerCase();
      const filename = `${Date.now()}_${Math.floor(Math.random() * 1e6)}${ext}`;
      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "sessionPlan",
        `${id}`,
        "banner",
        filename
      );
      await saveFile(banner, fullPath);
      updatePayload.bannerUrl = `uploads/sessionPlan/${id}/banner/${filename}`;
    }

    // ✅ Handle video upload if provided
    if (files.video?.[0]) {
      const video = files.video[0];
      const ext = path.extname(video.originalname).toLowerCase();
      const filename = `${Date.now()}_${Math.floor(Math.random() * 1e6)}${ext}`;
      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "sessionPlan",
        `${id}`,
        "videos",
        filename
      );
      await saveFile(video, fullPath);
      updatePayload.videoUrl = `uploads/sessionPlan/${id}/videos/${filename}`;
    }

    // ✅ Call service
    const result = await SessionPlanGroupService.updateSessionPlanGroup(
      id,
      updatePayload
    );

    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "update", result, false);
      return res.status(500).json(result);
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "update",
      {
        oneLineMessage: `Updated session plan group ID: ${id}`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Session plan group updated successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Update Group Error:", error);
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

exports.deleteSessionPlanGroup = async (req, res) => {
  const { id } = req.params;
  if (DEBUG) console.log("🗑️ Deleting group ID:", id);

  try {
    const result = await SessionPlanGroupService.deleteSessionPlanGroup(id);

    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "delete", result, false);
      return res.status(500).json(result);
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "delete",
      {
        oneLineMessage: `Deleted session plan group ID: ${id}`,
      },
      true
    );

    return res
      .status(200)
      .json({ status: true, message: "Group deleted successfully." });
  } catch (error) {
    console.error("❌ Delete Group Error:", error);
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
