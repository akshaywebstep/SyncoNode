const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../../middleware/admin/authenticate");
const upload = multer(); // ✅ Handles multipart/form-data

const {
  createSessionExercise,
  getAllSessionExercises,
  getSessionExerciseById,
  updateSessionExercise,
  deleteSessionExercise,
} = require("../../controllers/admin/sessionPlan/sessionExerciseController");

// 🌐 Base Path: /api/admin/session-plan-exercise

router.post("/", authMiddleware, upload.single("image"), createSessionExercise);

router.get("/", authMiddleware, getAllSessionExercises);

router.get("/:id", authMiddleware, getSessionExerciseById);

router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updateSessionExercise
);
router.delete("/:id", authMiddleware, deleteSessionExercise);

module.exports = router;
