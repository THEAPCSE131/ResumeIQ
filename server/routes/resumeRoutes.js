const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const resumeController = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

router.post(
  "/upload",
  protect,
  upload.single("resume"),
  resumeController.uploadResume,
);

module.exports = router;
