const customNotificationModel = require("../../../services/admin/notification/customNotification");
const { logActivity } = require("../../../utils/admin/activityLogger");

const validCategories = [
  "Complaints",
  "Payments",
  "Discounts",
  "Cancelled Memberships",
  "Admins",
  "Admin Roles",
  "System",
  "Activity Logs",
  "Security",
  "Login",
  "Settings",
  "Updates",
  "Announcements",
  "Tasks",
  "Messages",
  "Support",
];

const DEBUG = process.env.DEBUG === "true";
const PANEL = "admin";
const MODULE = "custom-notification";

// ✅ Create a new notification
exports.createCustomNotification = async (req, res) => {
  const { title, description, category, recipients } = req.body;

  if (DEBUG)
    console.log("📥 Create request:", {
      title,
      description,
      category,
      recipients,
    });

  if (!category) {
    const message = "Category is required.";
    console.warn(`⚠️ ${message}`);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "create",
      { oneLineMessage: message },
      false
    );
    return res.status(400).json({ status: false, message });
  }

  if (!validCategories.includes(category)) {
    const message = `Invalid category. Valid categories are: ${validCategories.join(
      ", "
    )}`;
    console.warn(`🚫 ${message}`);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "create",
      { oneLineMessage: message },
      false
    );
    return res.status(422).json({ status: false, message });
  }

  try {
    const result = await customNotificationModel.createCustomNotification(
      title || null,
      description || null,
      category,
      req.admin.id
    );

    if (!result.status) {
      console.error("❌ Creation failed:", result.message);
      await logActivity(req, PANEL, MODULE, "create", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    // ✅ Create notification reads for each recipient
    const adminIds = (recipients || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    await Promise.all(
      adminIds.map(async (adminId) => {
        const payload = {
          customNotificationId: result.data.id,
          adminId: parseInt(adminId, 10),
        };

        const readResult =
          await customNotificationModel.createCustomNotificationReads(payload);

        if (!readResult.status) {
          console.error(
            `❌ Failed to create read record for admin ${adminId}:`,
            readResult.message
          );
          await logActivity(req, PANEL, MODULE, "create", readResult, false);
          // Note: optionally continue or stop execution here
          throw new Error(`Failed to create read record for admin ${adminId}`);
        }
      })
    );

    if (DEBUG) console.log("✅ Created notification:", result.data);
    await logActivity(req, PANEL, MODULE, "create", result, true);

    return res.status(201).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Exception while creating notification:", error.message);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "create",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({
      status: false,
      message: "Server error while creating notification.",
    });
  }
};

// ✅ Get all custom notifications
// exports.getAllCustomNotifications = async (req, res) => {
//   if (DEBUG)
//     console.log("📬 Request received to fetch all custom notifications");

//   try {
//     const result = await customNotificationModel.getAllCustomNotifications();

//     if (!result.status) {
//       const message = result.message || "Failed to fetch custom notifications.";
//       console.error("❌ Fetch failed:", message);

//       await logActivity(
//         req,
//         PANEL,
//         MODULE,
//         "list",
//         { oneLineMessage: message },
//         false
//       );
//       return res.status(500).json({ status: false, message });
//     }

//     const count = result.data.length;
//     const message = `Fetched ${count} custom notification${
//       count === 1 ? "" : "s"
//     } successfully.`;

//     if (DEBUG) {
//       console.log("✅", message);
//       console.table(
//         result.data.map((n) => ({
//           ID: n.id,
//           Title: n.title,
//           Category: n.category,
//           CreatedAt: n.createdAt,
//         }))
//       );
//     }

//     await logActivity(
//       req,
//       PANEL,
//       MODULE,
//       "list",
//       { oneLineMessage: message },
//       true
//     );

//     return res.status(200).json({
//       status: true,
//       message,
//       data: result.data,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Exception while fetching custom notifications:",
//       error.message
//     );
//     await logActivity(
//       req,
//       PANEL,
//       MODULE,
//       "list",
//       { oneLineMessage: error.message },
//       false
//     );

//     return res.status(500).json({
//       status: false,
//       message: "Server error occurred while retrieving custom notifications.",
//     });
//   }
// };

exports.getAllCustomNotifications = async (req, res) => {
  if (DEBUG)
    console.log("📬 Request received to fetch all custom notifications");

  try {
    const adminId = req.admin?.id; // ✅ ensure we have adminId

    if (!adminId) {
      return res.status(400).json({
        status: false,
        message: "Admin ID missing from request.",
      });
    }

    // ✅ Pass adminId to model
    const result = await customNotificationModel.getAllCustomNotifications(
      adminId
    );

    if (!result.status) {
      const message = result.message || "Failed to fetch custom notifications.";
      console.error("❌ Fetch failed:", message);

      await logActivity(
        req,
        PANEL,
        MODULE,
        "list",
        { oneLineMessage: message },
        false
      );
      return res.status(500).json({ status: false, message });
    }

    const count = result.data.length;
    const message = `Fetched ${count} custom notification${
      count === 1 ? "" : "s"
    } successfully.`;

    if (DEBUG) {
      console.log("✅", message);
      console.table(
        result.data.map((n) => ({
          ID: n.id,
          Title: n.title,
          Category: n.category,
          CreatedAt: n.createdAt,
        }))
      );
    }

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      { oneLineMessage: message },
      true
    );

    return res.status(200).json({
      status: true,
      message,
      data: result.data,
    });
  } catch (error) {
    console.error(
      "❌ Exception while fetching custom notifications:",
      error.message
    );
    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      { oneLineMessage: error.message },
      false
    );

    return res.status(500).json({
      status: false,
      message: "Server error occurred while retrieving custom notifications.",
    });
  }
};
