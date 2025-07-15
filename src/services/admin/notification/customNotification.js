const { CustomNotification, CustomNotificationRead, Admin } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create a notification
exports.createCustomNotification = async (title, description, category, adminId) => {
  try {
    const notification = await CustomNotification.create({
      title: title || null,
      description: description || null,
      category,
      adminId,
      createdAt: new Date(),
    });

    return {
      status: true,
      data: {
        id: notification.id,
      },
      message: "Notification created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to create notification. ${error.message}`,
    };
  }
};

// ✅ Create a read record for a custom notification
exports.createCustomNotificationReads = async ({ customNotificationId, adminId, status = false }) => {
  try {
    console.log(`{ customNotificationId, adminId, status = false } - `, { customNotificationId, adminId, status });
    const readRecord = await CustomNotificationRead.create({
      customNotificationId,
      adminId,
      status,
      createdAt: new Date(),
    });

    return {
      status: true,
      data: {
        id: readRecord.id,
      },
      message: "Notification read record created successfully.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to create notification read record. ${error.message}`,
    };
  }
};

// ✅ Get all custom notifications
exports.getAllCustomNotifications = async (adminId = null, category = null) => {
  try {
    const where = {};
    if (adminId) where.adminId = adminId;
    if (category) where.category = category;

    const notifications = await CustomNotification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: CustomNotificationRead,
          as: 'reads',
          attributes: ['id', 'adminId', 'status', 'createdAt'],
          include: [
            {
              model: Admin,
              as: 'admin',
              attributes: ['id', 'firstName', 'lastName', 'email', 'profile']
            }
          ]
        },
        {
          model: Admin,
          as: 'admin',
          attributes: ['id', 'firstName', 'lastName', 'email', 'profile']
        }
      ]
    });

    return {
      status: true,
      message: `${notifications.length} notification(s) retrieved successfully.`,
      data: notifications,
    };
  } catch (error) {
    console.error("❌ Sequelize Error in getAllCustomNotifications:", error);
    return {
      status: false,
      message: `Error fetching custom notifications. ${error.message}`,
    };
  }
};

// ✅ Mark all unread custom notifications as read for a given admin
exports.markAsRead = async (adminId) => {
  try {
    if (!adminId) {
      return {
        status: false,
        message: "Admin ID is required to mark notifications as read.",
      };
    }

    // Update all unread records for this admin
    const [updatedCount] = await CustomNotificationRead.update(
      { status: true },
      {
        where: {
          adminId,
          status: false,
        },
      }
    );

    return {
      status: true,
      message: `${updatedCount} notification(s) marked as read.`,
      updatedCount,
    };
  } catch (error) {
    console.error("❌ Error in markAsRead:", error);
    return {
      status: false,
      message: `Failed to mark notifications as read. ${error.message}`,
    };
  }
};
