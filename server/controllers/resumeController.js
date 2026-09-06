const { extractTextFromResume } = require("../utils/resumeParser");
const analyzedResumeWithAI =
  require("../services/aiService").analyzedResumeWithAI;
const fs = require("fs/promises");
const { createHttpError } = require("../utils/httpError");
const {
  verifyFileSignature,
  validateExtractedText,
} = require("../utils/fileValidation");

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createHttpError(400, "Please upload a PDF or DOCX resume.");
    }
    const filePath = req.file.path;
    const originalname = req.file.originalname;
    const mimeType = req.file.mimetype;

    await verifyFileSignature(req.file);
    const extractedText = await extractTextFromResume(filePath, mimeType);
    const validatedText = validateExtractedText(extractedText);

    console.info("Resume text extracted for analysis", {
      mimeType,
      extractedTextLength: validatedText.length,
      hasExtractedText: validatedText.length > 0,
    });

    const aiResult = await analyzedResumeWithAI(validatedText);

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully!",
      originalname,
      data: aiResult,
    });
  } catch (error) {
    return next(error);
  } finally {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => undefined);
    }
  }
};

module.exports = { uploadResume };
