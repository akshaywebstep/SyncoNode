const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createClassSchedule,
  updateClassSchedule,
  getAllClassSchedules,
  getClassScheduleDetails,
  deleteClassSchedule,
} = require("../../controllers/admin/classSchedule/classScheduleController");

router.post("/", authMiddleware, createClassSchedule);
router.put("/:id", authMiddleware, updateClassSchedule);
router.get("/", authMiddleware, getAllClassSchedules);
router.get("/:id", authMiddleware, getClassScheduleDetails);
router.delete("/:id", authMiddleware, deleteClassSchedule);

module.exports = router;
