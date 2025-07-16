const { validateFormData } = require("../../../utils/validateFormData");
const { logActivity } = require("../../../utils/admin/activityLogger");

const TermGroupService = require("../../../services/admin/termAndDates/termGroup");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "term-group";

// ----------------------------------------
// ✅ TERM GROUP CONTROLLERS
// ----------------------------------------

exports.createTermGroup = async (req, res) => {
  const formData = req.body;
  const { name } = formData;

  if (DEBUG) {
    console.log("📥 Creating Term Group - Data:", formData);
  }

  const validation = validateFormData(formData, {
    requiredFields: ["name"],
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "create", validation.error, false);
    return res.status(400).json({ status: false, ...validation });
  }

  try {
    const result = await TermGroupService.createGroup({ name });
    await logActivity(req, PANEL, MODULE, "create", result, result.status);
    return res.status(result.status ? 201 : 500).json(result);
  } catch (error) {
    console.error("❌ Error in createTermGroup:", error);
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

exports.getAllGroups = async (req, res) => {
  try {
    const result = await TermGroupService.getAllGroups();
    await logActivity(req, PANEL, MODULE, "list", result, result.status);
    return res.status(result.status ? 200 : 500).json(result);
  } catch (error) {
    console.error("❌ Error in getAllGroups:", error);
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

exports.getGroupById = async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ status: false, message: "ID is required." });

  try {
    const result = await TermGroupService.getGroupById(id);
    await logActivity(req, PANEL, MODULE, "getById", result, result.status);
    return res.status(result.status ? 200 : 404).json(result);
  } catch (error) {
    console.error("❌ Error in getGroupById:", error);
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

exports.updateGroup = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const { name } = formData;

  const validation = validateFormData(formData, {
    requiredFields: ["name"],
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "update", validation.error, false);
    return res.status(400).json({ status: false, ...validation });
  }

  try {
    const result = await TermGroupService.updateGroup(id, { name });
    await logActivity(req, PANEL, MODULE, "update", result, result.status);
    return res.status(result.status ? 200 : 404).json(result);
  } catch (error) {
    console.error("❌ Error in updateGroup:", error);
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

exports.deleteGroup = async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ status: false, message: "ID is required." });

  try {
    const result = await TermGroupService.deleteGroup(id);
    await logActivity(req, PANEL, MODULE, "delete", result, result.status);
    return res.status(result.status ? 200 : 404).json(result);
  } catch (error) {
    console.error("❌ Error in deleteGroup:", error);
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
