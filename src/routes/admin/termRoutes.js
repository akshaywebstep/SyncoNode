const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createTerm,
  getAllTerms,
  getTermById,
  updateTerm,
  deleteTerm,
} = require("../../controllers/admin/termAndDates/termsController");

// ➕ Create Term
router.post("/", authMiddleware, createTerm);

// 📥 Get All Terms
router.get("/", authMiddleware, getAllTerms);

// 🔍 Get Term by ID
router.get("/:id", authMiddleware, getTermById);

// ✏️ Update Term
router.put("/:id", authMiddleware, updateTerm);

// 🗑️ Delete Term
router.delete("/:id", authMiddleware, deleteTerm);

module.exports = router;
