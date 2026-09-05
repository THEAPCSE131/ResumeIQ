const fs = require("fs/promises");
const path = require("path");
const { createHttpError } = require("./httpError");

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_LENGTH = 100000;

const allowedResumeTypes = new Map([
  [".pdf", PDF_MIME],
  [".docx", DOCX_MIME],
]);

const isAllowedResumeFile = (file) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  return allowedResumeTypes.get(extension) === file.mimetype;
};

const verifyFileSignature = async (file) => {
  const buffer = await fs.readFile(file.path);
  const extension = path.extname(file.originalname || "").toLowerCase();
  const isPdf = buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  const isZip = buffer.subarray(0, 4).toString("ascii") === "PK\x03\x04";

  if ((extension === ".pdf" && !isPdf) || (extension === ".docx" && !isZip)) {
    throw createHttpError(400, "The uploaded file does not match its declared format.");
  }
};

const validateExtractedText = (text) => {
  const normalizedText = typeof text === "string" ? text.trim() : "";

  if (!normalizedText) {
    throw createHttpError(400, "No readable text was found in the resume.");
  }

  if (normalizedText.length > MAX_EXTRACTED_TEXT_LENGTH) {
    throw createHttpError(400, "Resume text is too large to analyze.");
  }

  return normalizedText;
};

module.exports = {
  MAX_RESUME_SIZE_BYTES,
  isAllowedResumeFile,
  verifyFileSignature,
  validateExtractedText,
};
