const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

// Safe fallback lookup for common API key environment variable names
const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("CRITICAL BACKEND ERROR: No API Key found in process.env! Make sure GOOGLE_GENAI_API_KEY is configured in your .env file.");
}

const ai = new GoogleGenAI({
    apiKey: apiKey
});

/**
 * @description Service to generate structured interview report using native schema validation
 */
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
        You are an elite corporate technical interviewer. Analyze this candidate profile against the job description.
        
        Candidate Resume Data:
        ${resume || "Not provided"}

        Candidate Self-Description:
        ${selfDescription || "Not provided"}

        Target Job Description:
        ${jobDescription}
    `;

    const responseSchema = {
        type: "object",
        properties: {
            title: { type: "string" },
            applied_position: { type: "string" },
            executive_summary: { type: "string" },
            matchScore: { type: "integer" },
            overall_match_score: { type: "integer" },
            strengths: { type: "array", items: { type: "string" } },
            areas_for_growth: { type: "array", items: { type: "string" } },
            skill_alignment_breakdown: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" },
            technicalQuestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        intention: { type: "string" },
                        answer: { type: "string" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            behavioralQuestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        intention: { type: "string" },
                        answer: { type: "string" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            skillGaps: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        skill: { type: "string" },
                        severity: { type: "string" }
                    },
                    required: ["skill", "severity"]
                }
            },
            preparationPlan: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        day: { type: "integer" },
                        focus: { type: "string" },
                        tasks: { type: "array", items: { type: "string" } }
                    },
                    required: ["day", "focus", "tasks"]
                }
            }
        },
        required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "applied_position", "executive_summary"]
    };


    try {
        // 🌟 PERMANENT FIX: Updated to the required gemini-3.6-flash enterprise runtime identifier
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2 
            }
        });

        if (!response || !response.text) {
            throw new Error("No data streaming from the AI content channel.");
        }

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini Core Generation Rejection:", error.message);
        throw new Error(`AI Pipeline Failed: ${error.message}`);
    }
}

/**
 * @description Internal Puppeteer layout pipeline wrapper
 */
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        return await page.pdf({
            format: "A4",
            margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" }
        });
    } finally {
        await browser.close();
    }
}

/**
 * @description Service to compile and generate full-scale Resume PDF sheets
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a professional HTML resume page based on: ${resume}. Plan structure around target role: ${jobDescription}`;

    const resumePdfSchema = {
        type: "object",
        properties: {
            html: { type: "string" }
        },
        required: ["html"]
    };

    try {
        // 🌟 PERMANENT FIX: Updated to gemini-3.6-flash for the resume compiler tool as well
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: resumePdfSchema,
                temperature: 0.3
            }
        });

        const jsonContent = JSON.parse(response.text.trim());
        return await generatePdfFromHtml(jsonContent.html);
    } catch (error) {
        console.error("Resume Generation Processing Failure:", error);
        throw error;
    }
}

module.exports = { generateInterviewReport, generateResumePdf };
