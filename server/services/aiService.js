require("dotenv").config();

const Groq = require("groq-sdk");

const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_TIMEOUT_MS = 30000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: GROQ_TIMEOUT_MS,
});

const safeErrorMessage = (error) => {
  const message = error?.error?.message || error?.message || "Unknown provider error";
  return String(message).replace(/\s+/g, " ").slice(0, 300);
};

const analyzedResumeWithAI = async (resumeText) => {
  const prompt = `
You are an ATS Resume Analyzer.

Analyze the following resume and return ONLY valid JSON.

Required JSON format:

{
  "atsScore": number,
  "summary": "short summary",
  "matchedSkills": [],
  "missingSkills": [],
  "suggestions": []
}

Resume:
${resumeText}
`;

  try {
    console.info("Groq resume analysis request", {
      model: GROQ_MODEL,
      apiKeyConfigured: Boolean(process.env.GROQ_API_KEY),
      resumeTextLength: resumeText.length,
      promptLength: prompt.length,
      timeoutMs: GROQ_TIMEOUT_MS,
    });

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that analyzes resumes and provides insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const rawContent = response?.choices?.[0]?.message?.content;

    console.info("Groq resume analysis response", {
      model: GROQ_MODEL,
      responseId: response?.id || null,
      choiceCount: response?.choices?.length || 0,
      contentPresent: typeof rawContent === "string" && rawContent.length > 0,
      contentLength: typeof rawContent === "string" ? rawContent.length : 0,
    });

    if (typeof rawContent !== "string" || !rawContent.trim()) {
      throw new Error("Groq returned an empty analysis response.");
    }

    // clean markdown if AI returns ```json
    const cleaned = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Groq resume analysis JSON parsing failed", {
        model: GROQ_MODEL,
        responseLength: rawContent.length,
        cleanedLength: cleaned.length,
        errorName: error.name,
        errorMessage: safeErrorMessage(error),
      });
      throw error;
    }
  } catch (error) {
    console.error("Groq resume analysis failed", {
      model: GROQ_MODEL,
      errorName: error?.name || "Error",
      status: error?.status || error?.statusCode || null,
      code: error?.code || null,
      isTimeout: error?.name === "APIConnectionTimeoutError",
      errorMessage: safeErrorMessage(error),
    });
    throw error;
  }
};

module.exports = { analyzedResumeWithAI };
