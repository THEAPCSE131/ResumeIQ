const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("ResumeIQ API is healthy!");
});

module.exports = router;
