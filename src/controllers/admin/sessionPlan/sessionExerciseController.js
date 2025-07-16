const path = require("path");
const { validateFormData } = require("../../../utils/validateFormData");
const { saveFile } = require("../../../utils/fileHandler");
const SessionExerciseService = require("../../../services/admin/sessionPlan/sessionExercise");
const { logActivity } = require("../../../utils/admin/activityLogger");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "session-plan-exercise";

// ✅ Create Exercise
exports.createSessionExercise = async (req, res) => {
  const formData = req.body;
  const file = req.file;

  if (DEBUG) {
    console.log("📥 Create Exercise:", formData);
    if (file) console.log("📎 File uploaded:", file.originalname);
  }

  const validation = validateFormData(formData, {
    requiredFields: ["title"],
    fileExtensionValidations: { image: ["jpg", "jpeg", "png", "webp"] },
  });

  if (!validation.isValid) {
    if (DEBUG) console.log("❌ Validation failed:", validation.error);
    await logActivity(req, PANEL, MODULE, "create", validation.error, false);
    return res.status(400).json(validation);
  }

  try {
    // STEP 1: Create base record
    const createResult = await SessionExerciseService.createSessionExercise({
      title: formData.title,
      duration: formData.duration || null,
      description: formData.description || null,
      imageUrl: "", // to be updated after saving file
    });

    if (!createResult.status) {
      await logActivity(req, PANEL, MODULE, "create", createResult, false);
      return res
        .status(500)
        .json({ status: false, message: createResult.message });
    }

    const exerciseId = createResult.data.id;
    let savedImagePath = "";

    // STEP 2: Save image if present
    if (file) {
      const uniqueId = Math.floor(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${Date.now()}_${uniqueId}${ext}`;
      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "sessionExercise",
        `${exerciseId}`,
        filename
      );
      savedImagePath = `uploads/sessionExercise/${exerciseId}/${filename}`;

      try {
        await saveFile(file, fullPath);
        await SessionExerciseService.updateSessionExercise(exerciseId, {
          imageUrl: savedImagePath,
        });
      } catch (err) {
        console.error("❌ Failed to save image:", err);
      }
    }

    await logActivity(req, PANEL, MODULE, "create", createResult, true);
    return res.status(201).json({
      status: true,
      message: "Exercise created successfully",
      data: { ...createResult.data, imageUrl: savedImagePath },
    });
  } catch (error) {
    console.error("❌ Server error:", error);
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

// ✅ Get By ID
exports.getSessionExerciseById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await SessionExerciseService.getSessionExerciseById(id);
    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "getById", result, false);
      return res.status(404).json(result);
    }

    await logActivity(req, PANEL, MODULE, "getById", result, true);
    return res.status(200).json({
      status: true,
      message: "Fetched exercise successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ GetById error:", error);
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

// ✅ Get All
exports.getAllSessionExercises = async (req, res) => {
  if (DEBUG) console.log("📥 Fetching all exercises...");

  try {
    const result = await SessionExerciseService.getAllSessionExercises();
    if (!result.status) {
      if (DEBUG) console.log("⚠️ Fetch failed:", result.message);
      await logActivity(req, PANEL, MODULE, "list", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }
    if (DEBUG) {
      console.log("✅ exercises fetched successfully");
      console.table(result.data);
    }
    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      { oneLineMessage: `Fetched ${result.data.length || 0} exercises` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Fetched exercises successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Fetch error:", error);
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

// ✅ Update
exports.updateSessionExercise = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const file = req.file;

  if (file) {
    const uniqueId = Math.floor(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}_${uniqueId}${ext}`;
    const fullPath = path.join(
      process.cwd(),
      "uploads",
      "sessionExercise",
      `${id}`,
      filename
    );
    const imageUrl = `uploads/sessionExercise/${id}/${filename}`;

    try {
      await saveFile(file, fullPath);
      updates.imageUrl = imageUrl;
    } catch (err) {
      console.error("❌ Failed to save uploaded image:", err);
    }
  }

  try {
    const result = await SessionExerciseService.updateSessionExercise(
      id,
      updates
    );
    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "update", result, false);
      return res.status(404).json(result);
    }

    await logActivity(req, PANEL, MODULE, "update", result, true);
    return res.status(200).json({
      status: true,
      message: "Exercise updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
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

// ✅ Delete
exports.deleteSessionExercise = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await SessionExerciseService.deleteSessionExercise(id);
    if (!result.status) {
      await logActivity(req, PANEL, MODULE, "delete", result, false);
      return res.status(404).json(result);
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "delete",
      { oneLineMessage: `Deleted exercise ID: ${id}` },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Exercise deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete error:", error);
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
