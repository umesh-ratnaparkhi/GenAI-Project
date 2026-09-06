import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

/**
 * @description Service to generate interview report based on user self description, resume and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    // 🚨 1. GUARD CLAUSES: Prevent sending empty or corrupted payloads to the server
    if (!jobDescription || !jobDescription.trim()) {
        throw new Error("Job Description is required to generate a report.");
    }
    if (!selfDescription || !selfDescription.trim()) {
        throw new Error("Self Description is required to generate a report.");
    }
    if (!resumeFile) {
        throw new Error("Please upload a resume file.");
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription.trim());
    formData.append("selfDescription", selfDescription.trim());
    formData.append("resume", resumeFile); // Key matches backend upload.single("resume")

    try {
        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        // 🚨 2. CRITICAL RESPONSE SAFEGUARD: Validate that data exists before reading fields
        if (!response || !response.data) {
            throw new Error("No data returned from the server.");
        }

        // Return the clean data object safely
        return response.data;
    } catch (error) {
        // Bubble up structural error messages from Express validation layers
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        throw new Error(backendMessage || error.message || "Failed to generate interview report.");
    }
};

/**
 * @description Service to get interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {
    if (!interviewId) throw new Error("Interview ID is required.");
    
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`);
        return response?.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch report by ID.");
    }
};

/**
 * @description Service to get all interview reports of logged in user.
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview/");
        return response?.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch all reports.");
    }
};

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
    if (!interviewReportId) throw new Error("Interview Report ID is required to generate PDF.");

    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, {
            responseType: "blob" 
        });
        return response.data;
    } catch (error) {
        throw new Error("Failed to generate and download PDF document.");
    }
};
