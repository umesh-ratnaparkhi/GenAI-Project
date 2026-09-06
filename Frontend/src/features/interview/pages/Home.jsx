import React, { useState, useRef } from 'react'
import "../styles/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [uiError, setUiError] = useState("") // 🌟 Added error state to show validation messages safely
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        setUiError(""); // Reset any prior errors
        try {
            const resumeFile = resumeInputRef.current?.files?.[0]
            
            // 🚨 1. FRONTEND GUARD CLAUSES (Stops empty requests before hitting the API)
            if (!jobDescription || !jobDescription.trim()) {
                setUiError("Please paste a Job Description first.");
                return;
            }

            if (!resumeFile && (!selfDescription || !selfDescription.trim())) {
                setUiError("Please provide your profile by uploading a Resume OR filling out the Self-Description.");
                return;
            }

            // Execute the safely wrapped API wrapper
            const data = await generateReport({ 
                jobDescription, 
                selfDescription: selfDescription || "Provided via Resume Upload", 
                resumeFile: resumeFile || null 
            })
            
            // 🚨 2. FLEXIBLE REDIRECT CHECK (Handles all common backend return schemas)
            const reportId = data?._id || data?.interviewReport?._id || data?.id || data?.data?._id
            
            if (reportId) {
                navigate(`/interview/${reportId}`)
            } else {
                console.error("Could not find interview ID in API response data:", data)
                setUiError("Plan generated, but failed to retrieve the reference ID. Please check history.")
            }
        } catch (error) {
            console.error("Failed to execute data generation pipeline:", error)
            setUiError(error.message || "An unexpected error occurred while generating your report.")
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>
            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Global Error Banner */}
            {uiError && (
                <div className="error-banner" style={{ backgroundColor: '#ffebe9', color: '#cc0000', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(204,0,0,0.2)', textAlign: 'center', fontWeight: 'bold' }}>
                    {uiError}
                </div>
            )}

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            value={jobDescription}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription?.length || 0} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label className='dropzone' htmlFor='resume'>
                                <span className='dropzone__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                </span>
                                <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                <input ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf,.docx' />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                value={selfDescription}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button onClick={handleGenerateReport} className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

{/* Recent Reports List */}
{reports?.length > 0 && (
    <section className='recent-reports'>
        <h2>My Recent Interview Plans</h2>
        <ul className='reports-list'>
            {reports.map((item, index) => {
                const report = item?.interviewReport || item?.report || item;

                // Reads our translated 'title' first, then falls back to 'applied_position'
                const displayTitle = 
                    report?.title || 
                    report?.applied_position || 
                    report?.appliedPosition || 
                    "Interview Strategy Plan";

                return (
                    <li 
                        key={report?._id || report?.id || index} 
                        className='report-item' 
                        onClick={() => navigate(`/interview/${report?._id || report?.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h3>{displayTitle}</h3>
                    </li>
                );
            })}
        </ul>
    </section>
)}



        </div>
    )
}

export default Home;
