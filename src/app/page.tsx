'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Brain, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  GraduationCap,
  Wrench,
  Award
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalysisResult {
  candidateSummary: string
  recommendedJobs: Array<{
    title: string
    matchScore: number
    reason: string
  }>
  skillGaps: string[]
  improvements: string[]
  personalizedAdvice: string
  extractedInfo: {
    skills: string[]
    education: string[]
    experience: string[]
    tools: string[]
    certifications: string[]
  }
}

export default function CareerGuidancePage() {
  const [file, setFile] = useState<File | null>(null)
  const [preferences, setPreferences] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF or DOCX file')
        return
      }
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }, [])

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please upload your resume')
      return
    }

    setIsLoading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('resume', file)
    formData.append('preferences', preferences)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/analyze-career', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data = await response.json()
      setResult(data)
      toast.success('Analysis completed successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis')
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Career Guidance AI</h1>
              <p className="text-sm text-gray-500">NLP/ML-Powered Job Recommendation Engine</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Resume Upload Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-violet-500" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume in PDF or DOCX format for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 ${
                      file ? 'border-green-400 bg-green-50/50' : 'border-gray-300'
                    }`}
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Drop your resume here or click to browse</p>
                        <p className="text-sm text-gray-400 mt-1">Supports PDF and DOCX files</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Preferences Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-violet-500" />
                  Job Preferences (Optional)
                </CardTitle>
                <CardDescription>
                  Tell us about your career goals and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="E.g., I'm looking for a senior software engineer role in the tech industry, preferably remote. I have 5 years of experience with Python and machine learning..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze & Get Recommendations
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500 text-center">
                  {progress < 30 && 'Extracting resume content...'}
                  {progress >= 30 && progress < 60 && 'Analyzing skills and experience...'}
                  {progress >= 60 && progress < 90 && 'Matching with job roles...'}
                  {progress >= 90 && 'Generating recommendations...'}
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {!result && !isLoading && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 h-full flex items-center justify-center min-h-[600px]">
                <CardContent className="text-center py-16">
                  <Brain className="w-16 h-16 text-violet-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Career Analysis Awaits</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Upload your resume and let our NLP/ML engine analyze your skills, experience, 
                    and career trajectory to provide personalized job recommendations.
                  </p>
                </CardContent>
              </Card>
            )}

            {result && (
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-6">
                  {/* Candidate Summary */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-violet-500" />
                        Candidate Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{result.candidateSummary}</p>
                    </CardContent>
                  </Card>

                  {/* Extracted Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Skills */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-blue-500" />
                          Skills ({result.extractedInfo.skills.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {result.extractedInfo.skills.slice(0, 8).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {result.extractedInfo.skills.length > 8 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.extractedInfo.skills.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Education */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-green-500" />
                          Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {result.extractedInfo.education.slice(0, 3).map((edu, i) => (
                            <p key={i} className="text-xs text-gray-600">{edu}</p>
                          ))}
                          {result.extractedInfo.education.length === 0 && (
                            <p className="text-xs text-gray-400">Not detected</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tools & Technologies */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-orange-500" />
                          Tools & Tech
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {result.extractedInfo.tools.slice(0, 6).map((tool, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                          {result.extractedInfo.tools.length === 0 && (
                            <p className="text-xs text-gray-400">Not detected</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-500" />
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {result.extractedInfo.certifications.slice(0, 3).map((cert, i) => (
                            <p key={i} className="text-xs text-gray-600">{cert}</p>
                          ))}
                          {result.extractedInfo.certifications.length === 0 && (
                            <p className="text-xs text-gray-400">Not detected</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommended Job Roles */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Briefcase className="w-5 h-5 text-violet-500" />
                        Recommended Job Roles (Top 5)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.recommendedJobs.map((job, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-sm font-bold">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900">{job.title}</h4>
                            </div>
                            <Badge className={`${getMatchScoreColor(job.matchScore)} border font-semibold`}>
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{job.reason}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Skill Gap Analysis */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        Skill Gap Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.skillGaps.map((gap, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                          >
                            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{gap}</p>
                          </div>
                        ))}
                        {result.skillGaps.length === 0 && (
                          <p className="text-gray-500 text-sm">No significant skill gaps identified!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Improvement Suggestions */}
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        Improvement Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{improvement}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Personalized Advice */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <Target className="w-5 h-5" />
                        Personalized Advice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/90 leading-relaxed">{result.personalizedAdvice}</p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            Powered by NLP/ML Technology using Advanced Language Models
          </p>
        </div>
      </footer>
    </div>
  )
}
