const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createCustomNotification,
  getAllCustomNotifications,
} = require("../../controllers/admin/notification/customNotificationController");

// Create a new notification
router.post("/", authMiddleware, createCustomNotification);

// Get all notifications
router.get("/", authMiddleware, getAllCustomNotifications);

module.exports = router;
