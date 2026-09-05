const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  MAX_RESUME_SIZE_BYTES,
  isAllowedResumeFile,
} = require("./fileValidation");

const uploadDirectory = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (isAllowedResumeFile(file)) {
    cb(null, true);
  } else {
    const error = new Error("Only PDF and DOCX resumes are allowed.");
    error.statusCode = 400;
    error.expose = true;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES,
    files: 1,
  },
});

module.exports = upload;
