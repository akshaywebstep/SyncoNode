const { validateFormData } = require("../../../utils/validateFormData");
const { logActivity } = require("../../../utils/admin/activityLogger");

const TermService = require("../../../services/admin/termAndDates/term");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "term";

// ✅ CREATE TERM
exports.createTerm = async (req, res) => {
  const formData = req.body;

  if (DEBUG) {
    console.log("📥 Creating Term - Data:", formData);
  }

  const validation = validateFormData(formData, {
    requiredFields: [
      "termName",
      "termGroupId",
      "sessionPlanGroupId",
      "startDate",
      "endDate",
    ],
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "create", validation.error, false);
    return res.status(400).json({ status: false, ...validation });
  }

  try {
    const result = await TermService.createTerm(formData);
    await logActivity(req, PANEL, MODULE, "create", result, result.status);
    return res.status(result.status ? 201 : 500).json(result);
  } catch (error) {
    console.error("❌ Error in createTerm:", error);
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

// ✅ GET ALL TERMS
exports.getAllTerms = async (req, res) => {
  try {
    const result = await TermService.getAllTerms();
    await logActivity(req, PANEL, MODULE, "list", result, result.status);
    return res.status(result.status ? 200 : 500).json(result);
  } catch (error) {
    console.error("❌ Error in getAllTerms:", error);
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

// ✅ GET TERM BY ID
exports.getTermById = async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ status: false, message: "ID is required." });

  try {
    const result = await TermService.getTermById(id);
    await logActivity(req, PANEL, MODULE, "getById", result, result.status);
    return res.status(result.status ? 200 : 404).json(result);
  } catch (error) {
    console.error("❌ Error in getTermById:", error);
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

// ✅ UPDATE TERM
exports.updateTerm = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  const validation = validateFormData(formData, {
    requiredFields: [
      "termGroupId",
      "sessionPlanGroupId",
      "termName",
      "startDate",
      "endDate",
    ],
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "update", validation.error, false);
    return res.status(400).json({ status: false, ...validation });
  }

  try {
    const result = await TermService.updateTerm(id, formData);
    await logActivity(req, PANEL, MODULE, "update", result, result.status);
    return res.status(result.status ? 200 : 404).json(result);
  } catch (error) {
    console.error("❌ Error in updateTerm:", error);
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

// ✅ DELETE TERM
exports.deleteTerm = async (req, res) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ status: false, message: "ID is required." });

  try {
    const result = await TermService.deleteTerm(id);
    await logActivity(req, PANEL, MODULE, "delete", result, result.status);
    return res.status(result.status ? 200 : 404).json(result);
  } catch (error) {
    console.error("❌ Error in deleteTerm:", error);
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
