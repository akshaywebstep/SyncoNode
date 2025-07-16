const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createPaymentPlan,
  getAllPaymentPlans,
  getPaymentPlanById,
  updatePaymentPlan,
  deletePaymentPlan,
} = require("../../controllers/admin/payment/paymentPlanController");

// 🔐 Create a new payment plan (Protected)
router.post("/", authMiddleware, createPaymentPlan);

// 📦 Get all payment plans (Public or protect as needed)
router.get("/", authMiddleware, getAllPaymentPlans); // Optional: protect if required

// 📄 Get a specific payment plan by ID
router.get("/:id", authMiddleware, getPaymentPlanById);

// ✏️ Update a payment plan
router.put("/:id", authMiddleware, updatePaymentPlan);

// ❌ Delete a payment plan
router.delete("/:id", authMiddleware, deletePaymentPlan);

module.exports = router;
