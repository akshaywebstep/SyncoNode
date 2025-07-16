const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createTermGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} = require("../../controllers/admin/termAndDates/termGroupController");

// ➕ Create Term Group
router.post("/", authMiddleware, createTermGroup);

// 📥 Get All Term Groups
router.get("/", authMiddleware, getAllGroups);

// 🔍 Get Term Group by ID
router.get("/:id", authMiddleware, getGroupById);

// ✏️ Update Term Group
router.put("/:id", authMiddleware, updateGroup);

// 🗑️ Delete Term Group
router.delete("/:id", authMiddleware, deleteGroup);

module.exports = router;
