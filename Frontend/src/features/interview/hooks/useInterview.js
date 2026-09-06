import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let cleanData = null
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            
            // 🌟 FIX: Support both flat structures and nested interviewReport wrappers safely
            cleanData = response?.interviewReport || response;
            setReport(cleanData)
        } catch (error) {
            console.error("Hook Error (generateReport):", error)
            throw error; // Propagate the error so Home.jsx can capture it in its try/catch UI banner
        } finally {
            setLoading(false)
        }

        return cleanData
    }

    const getReportById = async (id) => {
        // Fallback to local parameter or component params destructured key
        const targetId = id || interviewId;
        if (!targetId) return null;

        setLoading(true)
        let cleanData = null
        try {
            const response = await getInterviewReportById(targetId)
            cleanData = response?.interviewReport || response;
            setReport(cleanData)
        } catch (error) {
            console.error("Hook Error (getReportById):", error)
        } finally {
            setLoading(false)
        }
        return cleanData
    }

    const getReports = async () => {
        setLoading(true)
        let cleanData = []
        try {
            const response = await getAllInterviewReports()
            cleanData = response?.interviewReports || response || [];
            setReports(Array.isArray(cleanData) ? cleanData : [])
        } catch (error) {
            console.error("Hook Error (getReports):", error)
            setReports([]) // Safe fallback to ensure UI map arrays do not throw length errors
        } finally {
            setLoading(false)
        }

        return cleanData
    }

    const getResumePdf = async (interviewReportId) => {
        if (!interviewReportId) return;
        setLoading(true)
        try {
            const fileBlob = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([fileBlob], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            
            // Clean up memory after trigger execution completion
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.error("Hook Error (getResumePdf):", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
