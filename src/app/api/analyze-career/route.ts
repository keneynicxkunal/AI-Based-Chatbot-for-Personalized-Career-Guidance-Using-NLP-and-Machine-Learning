import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, readFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import ZAI from 'z-ai-web-dev-sdk'

const execAsync = promisify(exec)

interface ExtractedInfo {
  skills: string[]
  education: string[]
  experience: string[]
  tools: string[]
  certifications: string[]
}

interface JobRecommendation {
  title: string
  matchScore: number
  reason: string
}

interface AnalysisResult {
  candidateSummary: string
  recommendedJobs: JobRecommendation[]
  skillGaps: string[]
  improvements: string[]
  personalizedAdvice: string
  extractedInfo: ExtractedInfo
}

// Extract text from PDF using pdfplumber
async function extractPdfText(filePath: string): Promise<string> {
  const script = `
import pdfplumber
import sys

with pdfplumber.open("${filePath}") as pdf:
    text = ""
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\\n"
    print(text)
`
  const scriptPath = join(tmpdir(), `extract_pdf_${Date.now()}.py`)
  await writeFile(scriptPath, script)
  
  try {
    const { stdout } = await execAsync(`python3 "${scriptPath}"`)
    return stdout.trim()
  } finally {
    await unlink(scriptPath)
  }
}

// Extract text from DOCX using pandoc
async function extractDocxText(filePath: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`pandoc "${filePath}" -t plain`)
    return stdout.trim()
  } catch {
    // Fallback to python-docx if pandoc fails
    const script = `
from docx import Document
import sys

doc = Document("${filePath}")
text = "\\n".join([para.text for para in doc.paragraphs])
print(text)
`
    const scriptPath = join(tmpdir(), `extract_docx_${Date.now()}.py`)
    await writeFile(scriptPath, script)
    
    try {
      const { stdout } = await execAsync(`python3 "${scriptPath}"`)
      return stdout.trim()
    } finally {
      await unlink(scriptPath)
    }
  }
}

// Parse resume based on file type
async function parseResume(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const tempPath = join(tmpdir(), `resume_${Date.now()}.${file.name.split('.').pop()}`)
  
  await writeFile(tempPath, buffer)
  
  try {
    let text = ''
    if (file.type === 'application/pdf') {
      text = await extractPdfText(tempPath)
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractDocxText(tempPath)
    } else {
      throw new Error('Unsupported file type')
    }
    return text
  } finally {
    await unlink(tempPath)
  }
}

// NLP-based analysis using LLM
async function analyzeWithNLP(resumeText: string, preferences: string): Promise<AnalysisResult> {
  const zai = await ZAI.create()
  
  const systemPrompt = `You are an advanced NLP/ML Career Guidance Assistant. Your task is to analyze resumes using natural language processing and machine learning techniques.

Analyze the given resume text and perform:
1. Named Entity Recognition (NER) to identify: skills, education institutions, companies, job titles, certifications
2. Text Classification for skill categorization (technical, soft skills, domain-specific)
3. Semantic Analysis for experience level and domain expertise
4. Pattern Recognition for career trajectory and transferable skills
5. Feature Extraction for job matching

You must respond with a valid JSON object in this exact format:
{
  "candidateSummary": "A 3-4 line professional summary of the candidate",
  "extractedInfo": {
    "skills": ["list of technical and soft skills extracted"],
    "education": ["list of education entries"],
    "experience": ["list of work experiences"],
    "tools": ["list of tools and technologies"],
    "certifications": ["list of certifications if any"]
  },
  "recommendedJobs": [
    {
      "title": "Job Title",
      "matchScore": 85,
      "reason": "Why this role fits based on skills and experience mapping"
    }
  ],
  "skillGaps": ["Missing or weak skills for top roles"],
  "improvements": ["Specific courses, technologies to learn, resume improvements"],
  "personalizedAdvice": "Specific actionable next steps for career growth"
}

Rules:
- Extract skills using NLP pattern matching (look for programming languages, frameworks, methodologies, tools)
- Identify education by recognizing university names, degrees, and dates
- Calculate match scores based on skill overlap and relevance (0-100)
- Be precise and professional
- If resume is weak or empty, provide constructive guidance
- Always return valid JSON, no markdown formatting`

  const userPrompt = `Analyze this resume using NLP/ML techniques:

RESUME TEXT:
${resumeText}

${preferences ? `USER PREFERENCES:\n${preferences}` : ''}

Perform comprehensive NLP analysis and provide job recommendations. Return ONLY the JSON response, no additional text.`

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    thinking: { type: 'disabled' }
  })

  const responseText = completion.choices[0]?.message?.content || ''
  
  // Extract JSON from response
  try {
    // Try to find JSON in the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult
    }
    throw new Error('No valid JSON found in response')
  } catch {
    // Return a default structure if parsing fails
    return {
      candidateSummary: 'Unable to parse resume details. Please ensure your resume is properly formatted.',
      extractedInfo: {
        skills: [],
        education: [],
        experience: [],
        tools: [],
        certifications: []
      },
      recommendedJobs: [
        { title: 'General Entry Level Position', matchScore: 50, reason: 'Based on available information' }
      ],
      skillGaps: ['Resume could not be properly parsed. Please check formatting.'],
      improvements: ['Consider using a standard resume format with clear sections'],
      personalizedAdvice: 'Please re-upload your resume in a clearer format or add more details to your preferences.'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File
    const preferences = formData.get('preferences') as string || ''

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 400 }
      )
    }

    // Parse resume
    const resumeText = await parseResume(file)
    
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from resume. Please ensure the file contains readable text.' },
        { status: 400 }
      )
    }

    // Perform NLP analysis
    const result = await analyzeWithNLP(resumeText, preferences)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Career analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred during analysis' },
      { status: 500 }
    )
  }
}
