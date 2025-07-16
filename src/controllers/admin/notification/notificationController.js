const notificationModel = require("../../../services/admin/notification/notification");
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
const MODULE = "notification";

/*
  // ✅ Create a new notification
  exports.createNotification = async (req, res) => {
    const { title, description, category } = req.body;

    if (DEBUG) console.log(`📥 Create request:`, { title, description, category });

    if (!category) {
      const message = "Category is required.";
      console.warn(`⚠️ ${message}`);
      await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: message }, false);
      return res.status(400).json({ status: false, message });
    }

    if (!validCategories.includes(category)) {
      const message = `Invalid category. Valid categories are: ${validCategories.join(", ")}`;
      console.warn(`🚫 ${message}`);
      await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: message }, false);
      return res.status(422).json({ status: false, message });
    }

    try {
      const result = await notificationModel.createNotification(
        title || null,
        description || null,
        category,
        req.admin.id
      );

      if (!result.status) {
        console.error(`❌ Creation failed:`, result.message);
        await logActivity(req, PANEL, MODULE, 'create', result, false);
        return res.status(500).json({ status: false, message: result.message });
      }

      if (DEBUG) console.log(`✅ Created notification:`, result.data);
      await logActivity(req, PANEL, MODULE, 'create', result, true);

      return res.status(201).json({
        status: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error(`❌ Exception while creating notification:`, error);
      await logActivity(req, PANEL, MODULE, 'create', { oneLineMessage: error.message }, false);
      return res.status(500).json({
        status: false,
        message: "Server error while creating notification.",
      });
    }
  };
*/

// ✅ Mark all unread notifications as read
exports.markNotificationAsRead = async (req, res) => {
  if (DEBUG)
    console.log(
      `📩 Marking notifications as read for Admin ID: ${req.admin.id}`
    );

  try {
    let result;
    if (req.admin.role.toLowerCase() == "admin") {
      result = await notificationModel.markAsRead(req.admin.id);
    } else {
      result = await customNotificationModel.markAsRead(req.admin.id);
    }

    if (!result.status) {
      console.error(`❌ Failed to mark as read:`, result.message);
      await logActivity(req, PANEL, MODULE, "markRead", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG) console.log(`✅ Marked as read:`, result.data);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "markRead",
      { oneLineMessage: result.message },
      true
    );

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(`❌ Error marking as read:`, error);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "markRead",
      { oneLineMessage: error.message },
      false
    );
    return res.status(500).json({
      status: false,
      message: "Server error while marking notifications as read.",
    });
  }
};

// ✅ Get all notifications
exports.getAllNotifications = async (req, res) => {
  if (DEBUG)
    console.log(`📨 Fetching all notifications for Admin ID: ${req.admin.id}`);
  const category = req.query.category;
  try {
    if (req.admin.role.toLowerCase() == "admin") {
      result = await notificationModel.getAllNotifications(
        req.admin.id,
        category
      );
    } else {
      result = await customNotificationModel.getAllCustomNotifications(
        req.admin.id,
        category
      );
    }

    if (!result.status) {
      console.error(`❌ Fetch failed:`, result.message);
      await logActivity(req, PANEL, MODULE, "list", result, false);
      return res.status(500).json({ status: false, message: result.message });
    }

    if (DEBUG)
      console.log(`📊 Total notifications:`, result.data.notifications?.length);
    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      {
        oneLineMessage: `Fetched ${
          result.data.notifications?.length || 0
        } notification(s) successfully.`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(`❌ Error fetching all notifications:`, error);
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
      message: "Server error while fetching notifications.",
    });
  }
};
