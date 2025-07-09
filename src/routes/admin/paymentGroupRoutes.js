const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createPaymentGroup,
  getAllPaymentGroups,
  getPaymentGroupById,
  updatePaymentGroup,
  deletePaymentGroup,
} = require("../../controllers/admin/paymentGroupController");

const {
  assignPlansToPaymentGroup,
} = require("../../controllers/admin/paymentGroupHasPlanController");

// 🔐 Create a new payment group (Protected)
router.post("/", authMiddleware, createPaymentGroup);

// 📦 Get all payment groups
router.get("/", authMiddleware, getAllPaymentGroups);

// 📄 Get a specific payment group by ID
router.get("/:id", authMiddleware, getPaymentGroupById);

// ✏️ Update a payment group
router.put("/:id", authMiddleware, updatePaymentGroup);

// ❌ Delete a payment group
router.delete("/:id", authMiddleware, deletePaymentGroup);

router.post("/:id/assign-plans", authMiddleware, assignPlansToPaymentGroup);

module.exports = router;
