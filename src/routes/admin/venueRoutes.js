const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/admin/authenticate");

const {
  createVenue,
  getAllVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} = require("../../controllers/admin/venue/venueController");

router.post("/", authMiddleware, createVenue);
router.get("/", authMiddleware, getAllVenues);
router.get("/:id", authMiddleware, getVenueById);
router.put("/:id", authMiddleware, updateVenue);
router.delete("/:id", authMiddleware, deleteVenue);

module.exports = router;
