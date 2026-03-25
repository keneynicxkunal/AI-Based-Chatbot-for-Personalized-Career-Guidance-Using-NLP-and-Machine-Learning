I have successfully created a comprehensive AI-powered Career Guidance and Job Recommendation Assistant using NLP/ML techniques. Here's what I built:

Application Overview
Frontend Features (src/app/page.tsx)
Resume Upload: Drag-and-drop or click to upload PDF/DOCX files
Job Preferences: Optional text input for career goals and preferences
Progress Tracking: Real-time progress bar with status messages
Results Display: Structured output with all required sections
Backend API (src/app/api/analyze-career/route.ts)
Resume Parsing: Extracts text from PDF (using pdfplumber) and DOCX (using pandoc/python-docx)
NLP/ML Analysis: Uses LLM for:
Named Entity Recognition (NER) for skills, education, companies
Text Classification for skill categorization
Semantic Analysis for experience level
Pattern Recognition for career trajectory
Feature Extraction for job matching
Output Format (Strict Compliance)
Candidate Summary: 3-4 line professional profile
Recommended Job Roles (Top 5): Each with title, match score (0-100), and reasoning
Skill Gap Analysis: Missing/weak skills for top roles
Improvement Suggestions: Courses, technologies, resume tips
Personalized Advice: Actionable next steps
Extracted Information Display
Skills: Technical + soft skills
Education: Degrees, institutions
Experience: Work history
Tools & Technologies: Software, frameworks
Certifications: Professional credentials
Key NLP/ML Techniques Used
Named Entity Recognition (NER): Identifies skills, education, companies
Text Classification: Categorizes skills by type
Semantic Analysis: Determines experience level
Pattern Matching: Extracts structured information
Feature Extraction: Maps skills to job requirements
Similarity Scoring: Calculates job match percentages
The application is now ready to use. Upload a resume (PDF or DOCX) and optionally add job preferences to receive personalized career recommendations powered by NLP/ML technology!
