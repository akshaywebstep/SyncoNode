const bcrypt = require("bcrypt");
const path = require("path");

const { createToken } = require("../../utils/jwt");
const { generatePasswordHint } = require("../../utils/auth");
const sendEmail = require("../../utils/email/sendEmail");

const adminModel = require("../../services/admin/admin");
const emailModel = require("../../services/email");
const countryModel = require("../../services/location/country");
const { validateFormData } = require("../../utils/validateFormData");
const { saveFile, deleteFile } = require("../../utils/fileHandler");

const { logActivity } = require("../../utils/admin/activityLogger");
const { createNotification } = require("../../utils/admin/notificationHelper");

// Set DEBUG flag
const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "admin";

exports.createAdmin = async (req, res) => {
  try {
    const formData = req.body;
    const file = req.file;

    if (DEBUG) console.log("📥 Received FormData:", formData);
    if (DEBUG && file) console.log("📎 Received File:", file.originalname);

    const email = formData.email;
    const password = formData.password;
    const name = formData.name;
    const position = formData.position || null;
    const phoneNumber = formData.phoneNumber || null;
    const roleId = formData.role || null;

    if (DEBUG) console.log("🔍 Checking if email already exists:", email);

    const { status: exists, data: existingAdmin } =
      await adminModel.findAdminByEmail(email);
    if (exists && existingAdmin) {
      if (DEBUG) console.log("❌ Email already registered:", email);

      await logActivity(
        req,
        PANEL,
        MODULE,
        "create",
        {
          oneLineMessage:
            "This email is already registered. Please use another email.",
        },
        false
      );
      return res.status(409).json({
        status: false,
        message: "This email is already registered. Please use another email.",
      });
    }

    if (DEBUG) console.log("✅ Email is available");

    const validation = validateFormData(formData, {
      requiredFields: ["name", "email", "password", "role"],
      patternValidations: {
        email: "email",
        status: "boolean",
      },
      fileExtensionValidations: {
        profile: ["jpg", "jpeg", "png", "webp"],
      },
    });

    if (!validation.isValid) {
      await logActivity(req, PANEL, MODULE, "create", validation.error, false);
      if (DEBUG) console.log("❌ Form validation failed:", validation.error);
      return res.status(400).json({
        status: false,
        error: validation.error,
        message: validation.message,
      });
    }

    if (DEBUG) console.log("✅ Form validation passed");

    const statusRaw = (formData.status || "").toString().toLowerCase();
    const status = ["true", "1", "yes", "active"].includes(statusRaw);

    if (DEBUG) console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    if (DEBUG) console.log("📦 Creating admin...");

    const createResult = await adminModel.createAdmin({
      firstName: name,
      email,
      password: hashedPassword,
      passwordHint: generatePasswordHint(password),
      position,
      phoneNumber,
      roleId,
      status,
    });

    if (!createResult.status) {
      await logActivity(req, PANEL, MODULE, "create", createResult, false);

      if (DEBUG) console.log("❌ Admin creation failed:", createResult.message);
      return res.status(500).json({
        status: false,
        message: createResult.message || "Failed to create admin.",
      });
    }

    const admin = createResult.data;
    let savedProfilePath = "";

    if (file) {
      const uniqueId = Math.floor(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}_${uniqueId}${ext}`;

      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "admin",
        `${admin.id}`,
        "profile",
        fileName
      );
      savedProfilePath = `uploads/admin/${admin.id}/profile/${fileName}`;

      if (DEBUG) console.log("📁 Saving file to:", fullPath);

      try {
        await saveFile(file, fullPath);
        await adminModel.updateAdmin(admin.id, { profile: savedProfilePath });

        if (DEBUG) console.log("✅ Profile image saved and updated in DB");
      } catch (fileErr) {
        console.error("❌ Failed to save profile image:", fileErr);
      }
    } else {
      if (DEBUG) console.log("ℹ️ No file uploaded, skipping file save.");
    }

    const successMessage = `New admin '${name}' created successfully by Admin: ${req.admin.name}`;
    if (DEBUG) console.log("✅", successMessage);

    await logActivity(req, PANEL, MODULE, "create", createResult, true);
    await createNotification(req, "New Admin Added", successMessage, "Admins");

    return res.status(201).json({
      status: true,
      message: "Admin created successfully.",
      data: {
        firstName: admin.firstName,
        email: admin.email,
        profile: admin.profile,
      },
    });
  } catch (error) {
    console.error("❌ Create Admin Error:", error);
    return res.status(500).json({
      status: false,
      message:
        "Server error occurred while creating the admin. Please try again later.",
    });
  }
};

// ✅ Get all admins
exports.getAllAdmins = async (req, res) => {
  if (DEBUG) console.log("📋 Request received to list all admins");

  try {
    const result = await adminModel.getAllAdmins();

    if (!result.status) {
      if (DEBUG) console.log("❌ Failed to retrieve admins:", result.message);

      await logActivity(req, PANEL, MODULE, "list", result, false);
      return res.status(500).json({
        status: false,
        message: result.message || "Failed to fetch admins.",
      });
    }

    if (DEBUG) {
      console.log(`✅ Retrieved ${result.data.length} admin(s)`);
      console.table(
        result.data.map((m) => ({
          ID: m.id,
          Name: m.name,
          Email: m.email,
          Created: m.createdAt,
        }))
      );
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      {
        oneLineMessage: `Fetched ${result.data.length} admin(s) successfully.`,
      },
      true
    );
    return res.status(200).json({
      status: true,
      message: `Fetched ${result.data.length} admin(s) successfully.`,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ List Admins Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch admins. Please try again later.",
    });
  }
};

// ✅ Get a specific admin profile
exports.getAdminProfile = async (req, res) => {
  const { id } = req.params;

  if (DEBUG) console.log("👤 Fetching admin profile for ID:", id);

  try {
    const result = await adminModel.getAdminById(id);

    if (!result.status || !result.data) {
      if (DEBUG) console.log("❌ Admin not found with ID:", id);
      return res
        .status(404)
        .json({ status: false, message: "Admin not found." });
    }

    const { data: admin } = result;

    if (DEBUG) console.log("✅ Admin found:", admin);

    return res.status(200).json({
      status: true,
      message: "Admin profile retrieved successfully.",
      data: admin,
    });
  } catch (error) {
    console.error("❌ Get Admin Profile Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch admin profile." });
  }
};

// ✅ Update admin details
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const file = req.file;

  if (DEBUG) console.log("🛠️ Updating admin ID:", id);
  if (DEBUG) console.log("📥 Received Update FormData:", formData);
  if (DEBUG && file) console.log("📎 Received File:", file.originalname);

  try {
    // Check if admin exists
    const existing = await adminModel.getAdminById(id);
    if (!existing.status || !existing.data) {
      if (DEBUG) console.log("❌ Admin not found:", id);
      return res
        .status(404)
        .json({ status: false, message: "Admin not found." });
    }

    if (DEBUG)
      console.log("🔍 Checking if email already exists:", formData.email);

    const { status: exists, data: existingAdmin } =
      await adminModel.findAdminByEmail(formData.email);
    if (DEBUG)
      console.log("{ status: exists, data: existingAdmin }:", {
        status: exists,
        data: existingAdmin,
      });

    if (
      exists &&
      existingAdmin &&
      existingAdmin.id.toString() !== id.toString()
    ) {
      if (DEBUG) console.log("❌ Email already registered:", formData.email);
      return res.status(409).json({
        status: false,
        message: "This email is already registered. Please use another email.",
      });
    }

    // Validate input (if any fields sent)
    const validation = validateFormData(formData, {
      requiredFields: [
        "firstName",
        "email",
        "position",
        "phoneNumber",
        "country",
        "city",
      ],
      patternValidations: {
        email: "email",
        status: "boolean",
        country: "number",
      },
      fileExtensionValidations: {
        profile: ["jpg", "jpeg", "png", "webp"],
      },
    });

    if (!validation.isValid) {
      if (DEBUG) console.log("❌ Validation failed:", validation.error);
      return res.status(400).json({
        status: false,
        error: validation.error,
        message: validation.message,
      });
    }

    // Prepare update data
    const updateData = {};
    if (formData.firstName)
      updateData.firstName = String(formData.firstName).trim();
    if (formData.lastName)
      updateData.lastName = String(formData.lastName).trim();
    if (formData.email) updateData.email = String(formData.email).trim();
    if (formData.position)
      updateData.position = String(formData.position).trim();
    if (formData.phoneNumber)
      updateData.phoneNumber = String(formData.phoneNumber).trim();
    if (formData.role) updateData.roleId = formData.role;
    if (formData.country) updateData.countryId = formData.country;
    if (formData.state) updateData.stateId = formData.state;
    if (formData.city) updateData.city = formData.city;
    if (formData.status) {
      const statusRaw = formData.status.toString().toLowerCase();
      updateData.status = ["true", "1", "yes", "active"].includes(statusRaw);
    }

    const countryCheck = await countryModel.getCountryById(
      updateData.countryId
    );
    if (!countryCheck.status) {
      return res.status(400).json({
        status: false,
        message: `${countryCheck.message}`,
      });
    }

    // Handle new profile image (if any)
    if (file) {
      const uniqueId = Math.floor(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}_${uniqueId}${ext}`;

      const fullPath = path.join(
        process.cwd(),
        "uploads",
        "admin",
        `${id}`,
        "profile",
        fileName
      );
      const relativePath = `uploads/admin/${id}/profile/${fileName}`;

      if (DEBUG) console.log("📁 Saving profile to:", fullPath);

      try {
        await saveFile(file, fullPath);
        updateData.profile = relativePath;

        await deleteFile(existingAdmin.profile);
        if (DEBUG) console.log("✅ Profile image saved and path set.");
      } catch (fileErr) {
        console.error("❌ Error saving profile image:", fileErr);
      }
    }

    // No update fields?
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields provided to update.",
      });
    }

    // Update DB
    const updateResult = await adminModel.updateAdmin(id, updateData);

    if (!updateResult.status) {
      if (DEBUG)
        console.log("❌ Failed to update admin:", updateResult.message);
      return res.status(500).json({
        status: false,
        message: updateResult.message || "Failed to update admin.",
      });
    }

    if (DEBUG) console.log("✅ Admin updated successfully.");

    return res.status(200).json({
      status: true,
      message: "Admin updated successfully.",
    });
  } catch (error) {
    console.error("❌ Update Admin Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update admin. Please try again later.",
    });
  }
};

// ✅ Update admin status
exports.changeAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  if (DEBUG)
    console.log(`🔄 Request to change admin ID ${id} status to: ${status}`);

  const allowedStatuses = ["active", "inactive", "suspend"];
  const normalizedStatus = status?.toString().toLowerCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      status: false,
      message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    const result = await adminModel.getAdminById(id);
    if (!result.status || !result.data) {
      if (DEBUG) console.log("❌ Admin not found:", id);
      return res
        .status(404)
        .json({ status: false, message: "Admin not found." });
    }

    const updateResult = await adminModel.updateAdmin(id, {
      status: normalizedStatus,
    });

    if (!updateResult.status) {
      return res.status(500).json({
        status: false,
        message: updateResult.message || "Failed to update status.",
      });
    }

    if (DEBUG)
      console.log(
        `✅ Status of admin ID ${id} changed to: ${normalizedStatus}`
      );

    return res.status(200).json({
      status: true,
      message: `Admin status updated to '${normalizedStatus}' successfully.`,
    });
  } catch (error) {
    if (DEBUG) error("❌ Change Admin Status Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update admin status. Please try again later.",
    });
  }
};

// ✅ Delete a admin
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  if (DEBUG) console.log("🗑️ Request received to delete admin ID:", id);

  try {
    // 🔍 Step 1: Check if admin exists
    const result = await adminModel.getAdminById(id);

    if (!result.status || !result.data) {
      const message = `Admin with ID ${id} not found.`;
      if (DEBUG) console.log("❌", message);

      await logActivity(
        req,
        PANEL,
        MODULE,
        "delete",
        { oneLineMessage: message },
        false
      );

      return res.status(404).json({ status: false, message });
    }

    const admin = result.data;

    // 🧹 Step 2: Attempt to delete
    const deleteResult = await adminModel.deleteAdmin(id);

    if (!deleteResult.status) {
      const message =
        deleteResult.message || `Failed to delete admin with ID ${id}.`;
      if (DEBUG) console.log("❌", message);

      await logActivity(
        req,
        PANEL,
        MODULE,
        "delete",
        { oneLineMessage: message },
        false
      );

      return res.status(500).json({ status: false, message });
    }

    const successMessage = `Admin '${admin.firstName} ${
      admin.lastName || ""
    }' (ID: ${id}) deleted by Admin: ${req.admin?.name}`;
    if (DEBUG) console.log("✅", successMessage);

    await logActivity(
      req,
      PANEL,
      MODULE,
      "delete",
      { oneLineMessage: successMessage },
      true
    );
    await createNotification(
      req,
      "Admin Deleted",
      successMessage,
      "Cancelled Adminships"
    );

    return res.status(200).json({
      status: true,
      message: "Admin deleted successfully.",
    });
  } catch (error) {
    const errorMsg =
      error?.message || "Failed to delete admin due to server error.";
    console.error("❌ Delete Admin Error:", errorMsg);
    return res.status(500).json({
      status: false,
      message: errorMsg,
    });
  }
};
