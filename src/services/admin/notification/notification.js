const { Notification, NotificationRead, User } = require("../../../models");
const { Op } = require("sequelize");

// ✅ Create a notification
exports.createNotification = async (title, description, category, adminId) => {
  try {
    const notification = await Notification.create({
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

// ✅ Mark all unread notifications as read for the admin
exports.markAsRead = async (adminId) => {
  try {
    const allNotifications = await Notification.findAll({ attributes: ["id"] });

    const readNotifications = await NotificationRead.findAll({
      where: { adminId },
      attributes: ["notificationId"],
    });

    const readIds = readNotifications.map((r) => r.notificationId);

    const unread = allNotifications.filter((n) => !readIds.includes(n.id));

    const newReadEntries = unread.map((n) => ({
      adminId,
      notificationId: n.id,
    }));

    if (newReadEntries.length > 0) {
      await NotificationRead.bulkCreate(newReadEntries);
    }

    return {
      status: true,
      data: {
        markedAsRead: newReadEntries.length,
        totalAvailable: allNotifications.length,
      },
      message:
        newReadEntries.length > 0
          ? `${newReadEntries.length} new notification(s) marked as read.`
          : "All notifications were already marked as read.",
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to mark notifications as read. ${error.message}`,
    };
  }
};

// ✅ Get all notifications with read status
// exports.getAllNotifications = async (adminId, category = null) => {
//   try {
//     const whereCondition = {};
//     if (category) {
//       whereCondition.category = category;
//     }

//     const notifications = await Notification.findAll({
//       where: whereCondition,
//       order: [["createdAt", "DESC"]],
//     });

//     const readRecords = await NotificationRead.findAll({
//       where: { adminId },
//       attributes: ["notificationId"],
//     });

//     const readIdsSet = new Set(readRecords.map(r => r.notificationId));

//     const notificationList = notifications.map(notification => ({
//       id: notification.id,
//       title: notification.title,
//       description: notification.description,
//       category: notification.category,
//       createdAt: notification.createdAt,
//       isRead: readIdsSet.has(notification.id),
//     }));

//     return {
//       status: true,
//       data: notificationList,
//       message: `${notificationList.length} notification(s) retrieved successfully.`,
//     };
//   } catch (error) {
//     return {
//       status: false,
//       message: `Failed to retrieve notifications. ${error.message}`,
//     };
//   }
// };

exports.getAllNotifications = async (adminId, category = null) => {
  try {
    const whereCondition = {};
    if (category) {
      whereCondition.category = category;
    }

    // ✅ Fetch all notifications (no includes!)
    const notifications = await Notification.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      raw: true, // ensures plain objects
    });

    // ✅ Fetch all read notifications for THIS admin
    const readRecords = await NotificationRead.findAll({
      where: { adminId },
      attributes: ["notificationId"],
      raw: true,
    });

    // ✅ Put all read IDs in a Set for quick lookup
    const readIdsSet = new Set(readRecords.map((r) => r.notificationId));

    // ✅ Merge result → always `true/false`
    const notificationList = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      category: n.category,
      createdAt: n.createdAt,
      isRead: readIdsSet.has(n.id),
    }));

    return {
      status: true,
      data: notificationList,
      message: `${notificationList.length} notification(s) retrieved successfully.`,
    };
  } catch (error) {
    return {
      status: false,
      message: `Failed to retrieve notifications. ${error.message}`,
    };
  }
};
