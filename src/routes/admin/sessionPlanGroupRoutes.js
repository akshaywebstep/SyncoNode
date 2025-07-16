// routes/admin/sessionPlan/sessionPlanGroup.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../../middleware/admin/authenticate");
const upload = multer(); // In-memory multer storage

const {
  createSessionPlanGroup,
  getSessionPlanGroups,
  getSessionPlanGroupById,
  updateSessionPlanGroup,
  deleteSessionPlanGroup,
  getSessionPlanPreview,
} = require("../../controllers/admin/sessionPlan/sessionPlanGroupController");

// Base Route: /api/admin/session-plan-group

// ✅ Create
router.post(
  "/",
  authMiddleware,
  upload.fields([
    // { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "banner", maxCount: 1 }, // optional if your controller uses "banner"
  ]),
  createSessionPlanGroup
);

// ✅ Get All
router.get("/", authMiddleware, getSessionPlanGroups);

// ✅ Get by ID
router.get("/:id", authMiddleware, getSessionPlanGroupById);

// ✅ Update
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "banner", maxCount: 1 }, // optional if your update controller uses "banner"
  ]),
  updateSessionPlanGroup
);

// ✅ Delete
router.delete("/:id", authMiddleware, deleteSessionPlanGroup);

module.exports = router;
