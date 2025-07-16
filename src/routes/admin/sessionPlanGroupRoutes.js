const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../../middleware/admin/authenticate");

// ✅ Multer in-memory storage for banner & video uploads
const upload = multer();

const {
  createSessionPlanGroup,
  getAllSessionPlanGroups,
  getSessionPlanGroupDetails,
  updateSessionPlanGroup,
  deleteSessionPlanGroup,
} = require("../../controllers/admin/sessionPlan/sessionPlanGroupController");

// ✅ Create Session Plan Group
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createSessionPlanGroup
);

// ✅ Get All Session Plan Groups
router.get("/", authMiddleware, getAllSessionPlanGroups);

// ✅ Get Session Plan Group by ID
router.get("/:id", authMiddleware, getSessionPlanGroupDetails);

// ✅ Update Session Plan Group
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateSessionPlanGroup
);

// ✅ Delete Session Plan Group
router.delete("/:id", authMiddleware, deleteSessionPlanGroup);

module.exports = router;
