const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Resume file must be 5 MB or smaller."
        : "Invalid resume upload.";
    return res.status(400).json({ success: false, message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : "An unexpected error occurred.";

  if (statusCode >= 500) {
    console.error("Request failed", {
      method: req.method,
      path: req.originalUrl,
      statusCode,
    });
  }

  return res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };
