const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");
const {
  createAdmin,
  getAllAdmins,
  updateAdmin,
  changeAdminStatus,
  deleteAdmin,
  getAdminProfile,
  resetPassword,
} = require("../../controllers/admin/adminController");

const multer = require("multer");
const upload = multer();

router.use("/role", require("./roleRoutes"));
router.use("/notification", require("./notificationRoutes"));
router.use("/custom-notification", require("./customNotification"));
router.use("/payment-plan", require("./paymentPlanRoutes"));
router.use("/payment-group", require("./paymentGroupRoutes"));
router.use("/discount", require("./discountRoutes"));
router.use("/session-plan-group", require("./sessionPlanGroupRoutes"));
router.use("/session-plan-exercise", require("./sessionExerciseRoutes"));
router.use("/term-group", require("./termGroupRoutes"));
router.use("/term", require("./termRoutes"));
router.use("/venue", require("./venueRoutes"));
router.use("/class-schedule", require("./classScheduleRoutes"));
router.use("/cancel-class", require("./cancelClassRoutes"));

// Base: /api/admin/admin
router.post("/", upload.single("profile"), authMiddleware, createAdmin);
router.get("/", getAllAdmins);
router.get("/:id", authMiddleware, getAdminProfile);
router.put("/:id", upload.single("profile"), authMiddleware, updateAdmin);
router.patch("/:id/status", authMiddleware, changeAdminStatus);
router.delete("/:id", authMiddleware, deleteAdmin);
// ✅ Reset password
router.post("/reset-password", authMiddleware, resetPassword);

// Mount sub-routes here

module.exports = router;
