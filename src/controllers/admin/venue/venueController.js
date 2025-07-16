const { validateFormData } = require("../../../utils/validateFormData");
const { logActivity } = require("../../../utils/admin/activityLogger");
const venueModel = require("../../../services/admin/venue/venue");

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "venue";

// ✅ Create Venue
exports.createVenue = async (req, res) => {
  const formData = req.body;

  if (DEBUG) console.log("📥 Creating Venue - Data:", formData);

  const validation = validateFormData(formData, {
    requiredFields: ["area", "name", "address", "facility"],
    enumValidations: {
      facility: ["Indoor", "Outdoor"],
    },
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "create", validation.error, false);
    return res.status(400).json({
      status: false,
      message: validation.message,
      error: validation.error,
    });
  }

  try {
    const result = await venueModel.createVenue(formData);

    await logActivity(req, PANEL, MODULE, "create", result, result.status);

    if (!result.status) {
      return res.status(500).json({ status: false, message: result.message });
    }

    return res.status(201).json({
      status: true,
      message: "Venue created successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Create Venue Error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error while creating venue.",
    });
  }
};

// ✅ Get All Venues
exports.getAllVenues = async (req, res) => {
  try {
    const result = await venueModel.getAllVenues();

    await logActivity(req, PANEL, MODULE, "list", result, result.status);

    if (!result.status) {
      return res.status(500).json({
        status: false,
        message: result.message || "Failed to fetch venues.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Venues fetched successfully.",
      data: result.data, // ✅ make sure to include full nested data
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Failed to fetch venues.",
    });
  }
};

// ✅ Get by ID
exports.getVenueById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await venueModel.getVenueById(id);

    if (!result.status) {
      return res
        .status(404)
        .json({ status: false, message: "Venue not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Venue fetched successfully.",
      data: result.data,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch venue." });
  }
};

// ✅ Update Venue
exports.updateVenue = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;

  if (DEBUG) console.log("🛠️ Updating Venue ID:", id, formData);

  const validation = validateFormData(formData, {
    requiredFields: ["area", "name", "address", "facility"],
    enumValidations: {
      facility: ["Indoor", "Outdoor"],
    },
  });

  if (!validation.isValid) {
    await logActivity(req, PANEL, MODULE, "update", validation.error, false);
    return res.status(400).json({
      status: false,
      message: validation.message,
      error: validation.error,
    });
  }

  const result = await venueModel.updateVenue(id, formData);

  await logActivity(req, PANEL, MODULE, "update", result, result.status);

  if (!result.status) {
    return res.status(500).json({ status: false, message: result.message });
  }

  return res.status(200).json({
    status: true,
    message: result.message,
    data: result.data,
  });
};

// ✅ Delete Venue
exports.deleteVenue = async (req, res) => {
  const { id } = req.params;

  const result = await venueModel.deleteVenue(id);

  await logActivity(req, PANEL, MODULE, "delete", result, result.status);

  if (!result.status) {
    return res.status(500).json({ status: false, message: result.message });
  }

  return res.status(200).json({
    status: true,
    message: "Venue deleted successfully.",
  });
};
