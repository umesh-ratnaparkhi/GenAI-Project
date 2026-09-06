const PDFParser = require("pdf2json"); // Highly stable, avoids package path export errors
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        // 1. Validate file upload
        if (!req.file) {
            return res.status(400).json({ message: "Resume PDF file is required." });
        }

        let extractedText = "";

        // Async parsing block using pdf2json stream reader
        try {
            extractedText = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser();
                
                pdfParser.on("pdfParser_dataReady", (pdfData) => {
                    const textContent = pdfParser.getRawTextContent();
                    resolve(textContent || "");
                });

                pdfParser.on("pdfParser_dataError", (errData) => {
                    reject(new Error(errData.parserError || "Unknown pdf2json error"));
                });

                pdfParser.parseBuffer(req.file.buffer);
            });
        } catch (pdfError) {
            console.error("PDF Parsing Engine Internal Error:", pdfError);
            return res.status(400).json({ 
                message: "Failed to extract text from the uploaded PDF resume. Ensure the file is not corrupted.",
                error: pdfError.message 
            });
        }

        const { selfDescription, jobDescription } = req.body;

        // 3. Call your Gemini service layer
             // Call your Gemini service layer
        const interViewReportByAi = await generateInterviewReport({
            resume: extractedText,
            selfDescription,
            jobDescription
        });

        // Translate AI's custom property names into explicit Mongoose schema fields
        const reportTitle = interViewReportByAi?.applied_position || interViewReportByAi?.title || req.body.title || "Generated Interview Plan";
        const score = interViewReportByAi?.overall_match_score || interViewReportByAi?.matchScore || 0;

        // 🌟 PERMANENT CONTROLLER GUARD: Sanitize skillGaps severity values to strict lowercase strings
        let cleanSkillGaps = [];
        if (Array.isArray(interViewReportByAi?.skillGaps)) {
            cleanSkillGaps = interViewReportByAi.skillGaps.map(gap => ({
                skill: gap?.skill || "General Technical Alignment",
                severity: String(gap?.severity || "medium").toLowerCase().trim() // Converts 'Medium' -> 'medium'
            }));
        }

        // Save document safely to MongoDB
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            title: reportTitle, 
            matchScore: score,  
            resume: extractedText,
            selfDescription: selfDescription || "Provided via Uploaded File Component",
            jobDescription,
            ...interViewReportByAi,
            skillGaps: cleanSkillGaps // Overwrites dirty casing strings with our verified lowercase structure array
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport 
        });

    } catch (error) {
        console.error("Generation Controller Error:", error);
        return res.status(500).json({
            message: "Failed to generate interview report.",
            error: error.message
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Get Report By ID Error:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("title matchScore createdAt applied_position");

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Get All Reports Error:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("PDF Generation Controller Error:", error);
        return res.status(500).json({ message: "Failed to compile Resume PDF.", error: error.message });
    }
}

// 🌟 ALL EXPORTS CLEARLY DEFINED NOW
module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};
