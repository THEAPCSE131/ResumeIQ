require("dotenv").config();

// const OpenAI = require("openai");

const Groq = require("groq-sdk");

// const openai = new OpenAI({
// apiKey: process.env.OPENAI_API_KEY,
// });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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

    const rawContent = response.choices[0].message.content;

    console.log("RAW AI RESPONSE:", rawContent);

    // clean markdown if AI returns ```json
    const cleaned = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error analyzing resume with AI:", error);
    throw error;
  }
};

module.exports = { analyzedResumeWithAI };
