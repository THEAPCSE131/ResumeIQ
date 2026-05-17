const extractTextFromResume = require("../utils/resumeParser");
const analyzedResumeWithAI =
  require("../services/aiService").analyzedResumeWithAI;

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const filePath = req.file.path;
    const filename = req.file.filename;
    const originalname = req.file.originalname;
    const mimeType = req.file.mimetype;

    // Extract text from the uploaded resume
    const extractedText =
      await require("../utils/resumeParser").extractTextFromResume(
        filePath,
        mimeType,
      );

    // Analyze the extracted text with AI
    const aiResult = await analyzedResumeWithAI(extractedText);

    res.status(200).json({
      message: "Resume uploaded successfully!",
      originalname,
      data: aiResult, // Return first 500 characters for preview
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ message: "Error uploading resume", error });
  }
};

module.exports = { uploadResume };
