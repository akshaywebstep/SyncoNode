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
  const adminId = req.admin?.id;
  const category = req.query?.category || null;

  if (DEBUG) {
    console.log(`📨 Fetching notifications for Admin ID: ${adminId}`);
    console.log(`📂 Category filter: ${category}`);
    console.log(`🔐 Admin Role: ${req.admin?.role}`);
  }

  try {
    // Fetch regular notifications
    const notificationResult = await notificationModel.getAllNotifications(
      adminId,
      category
    );

    // Fetch custom notifications
    const customNotificationResult =
      await customNotificationModel.getAllCustomNotifications(
        adminId,
        category
      );

    // Combine results
    const combinedData = {
      notifications: notificationResult?.data || [],
      customNotifications: customNotificationResult?.data || [],
    };

    // Validate status
    if (!notificationResult.status || !customNotificationResult.status) {
      const errorMsg =
        notificationResult.message ||
        customNotificationResult.message ||
        "Failed to fetch notifications.";

      console.error("❌ Notification fetch failed:", errorMsg);

      await logActivity(
        req,
        PANEL,
        MODULE,
        "list",
        { oneLineMessage: errorMsg },
        false
      );

      return res.status(500).json({
        status: false,
        message: errorMsg,
      });
    }

    // Log success
    const totalCount =
      (combinedData.notifications?.length || 0) +
      (combinedData.customNotifications?.length || 0);

    await logActivity(
      req,
      PANEL,
      MODULE,
      "list",
      {
        oneLineMessage: `Successfully fetched ${totalCount} notification(s).`,
      },
      true
    );

    return res.status(200).json({
      status: true,
      message: "Notifications fetched successfully.",
      data: combinedData,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error.message);

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
