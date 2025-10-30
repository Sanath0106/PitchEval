'use client'

import { useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import AppHeader from '@/components/ui/AppHeader'
import ProcessingLoader from '@/components/ui/ProcessingLoader'


export default function HackathonUpload() {
  const [hackathonName, setHackathonName] = useState('')
  const [tracks, setTracks] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')

  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templateAnalysisStatus, setTemplateAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle')
  const [templateAnalysis, setTemplateAnalysis] = useState<any>(null)
  const [files, setFiles] = useState<File[]>([])
  const [weights, setWeights] = useState({
    innovation: 25,
    feasibility: 25,
    impact: 25,
    clarity: 25,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [hackathonId, setHackathonId] = useState<string | null>(null)

  const handleTemplateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Enhanced file validation
      if (file.type !== 'application/pdf') {
        alert('Invalid file format. Only PDF files are allowed for templates.')
        e.target.value = ''
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds limit. Template files must be under 10MB.')
        e.target.value = ''
        return
      }

      if (file.size < 1024) {
        alert('File appears to be empty or corrupted. Please upload a valid PDF template.')
        e.target.value = ''
        return
      }
      
      setTemplateFile(file)
      setTemplateAnalysisStatus('analyzing')
      setTemplateAnalysis(null)
      
      try {
        // Analyze template structure
        const formData = new FormData()
        formData.append('templateFile', file)
        if (additionalInfo) {
          formData.append('additionalContext', additionalInfo)
        }
        
        const response = await fetch('/api/templates/analyze', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (response.ok && result.success) {
          setTemplateAnalysis(result)
          setTemplateAnalysisStatus('complete')
        } else {
          throw new Error(result.error || 'Template analysis failed')
        }
      } catch (error) {
        console.error('Template analysis error:', error)
        setTemplateAnalysisStatus('error')
        
        // Show specific error message to user
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze template. Please try again.'
        alert(errorMessage)
        
        // Reset template file on error
        setTemplateFile(null)
      }
      
      e.target.value = ''
    }
  }

  const removeTemplateFile = () => {
    setTemplateFile(null)
    setTemplateAnalysis(null)
    setTemplateAnalysisStatus('idle')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      
      // Validate each file
      const validFiles: File[] = []
      const invalidFiles: string[] = []
      
      newFiles.forEach(file => {
        // Check file type
        if (file.type !== 'application/pdf') {
          invalidFiles.push(`${file.name} (not a PDF)`)
          return
        }
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          invalidFiles.push(`${file.name} (exceeds 10MB)`)
          return
        }
        
        validFiles.push(file)
      })
      
      // Show error for invalid files
      if (invalidFiles.length > 0) {
        alert(`The following files were rejected:\n${invalidFiles.join('\n')}\n\nOnly PDF files under 10MB are allowed.`)
      }
      
      // Add valid files
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles].slice(0, 20)) // Max 20 files
      }
      
      // Clear the input
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleWeightChange = (criterion: string, value: number[]) => {
    const newWeight = value[0]
    const oldWeight = weights[criterion as keyof typeof weights]
    const difference = newWeight - oldWeight
    
    // Distribute the difference among other criteria
    const otherCriteria = Object.keys(weights).filter(key => key !== criterion)
    const adjustmentPerCriterion = -difference / otherCriteria.length
    
    const newWeights = { ...weights }
    newWeights[criterion as keyof typeof weights] = newWeight
    
    otherCriteria.forEach(key => {
      const adjustedValue = newWeights[key as keyof typeof weights] + adjustmentPerCriterion
      newWeights[key as keyof typeof weights] = Math.round(Math.max(0, Math.min(100, adjustedValue)))
    })
    
    // Ensure total is exactly 100% by adjusting the last criterion if needed
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
    if (total !== 100 && otherCriteria.length > 0) {
      const lastCriterion = otherCriteria[otherCriteria.length - 1] as keyof typeof weights
      newWeights[lastCriterion] += (100 - total)
      newWeights[lastCriterion] = Math.max(0, Math.min(100, newWeights[lastCriterion]))
    }
    
    setWeights(newWeights)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hackathonName || files.length === 0) return

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('hackathonName', hackathonName)
    formData.append('tracks', tracks)
    formData.append('additionalInfo', additionalInfo)

    formData.append('weights', JSON.stringify(weights))
    
    // Add template file and analysis if available
    if (templateFile) {
      formData.append('templateFile', templateFile)
    }
    if (templateAnalysis) {
      formData.append('templateAnalysis', JSON.stringify(templateAnalysis))
    }
    
    files.forEach((file) => {
      formData.append(`files`, file)
    })

    try {
      const response = await fetch('/api/evaluate/hackathon', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setHackathonId(result.hackathonId)
        // Keep isUploading true - ProcessingLoader will handle completion
      } else {
        setIsUploading(false)
      }
    } catch (error) {
      // Handle upload error
      setIsUploading(false)
    }
  }

  // Show processing loader when uploading
  if (isUploading) {
    return (
      <ProcessingLoader 
        message="Bulk Analysis in Progress"
        submessage={`Analyzing ${files.length} presentations with track validation...`}
        hackathonId={hackathonId || undefined}
        pollForCompletion={!!hackathonId}
        onComplete={() => {
          window.location.href = `/dashboard/hackathon/results/${hackathonId}`
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Blue Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated gradient orbs - Blue theme */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-gradient-shift"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-60 right-1/3 w-64 h-64 bg-cyan-500/6 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '6s'}}></div>
        
        {/* Floating particles - Blue theme */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/50 rounded-full animate-particle-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300/40 rounded-full animate-particle-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-particle-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-particle-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-blue-500/40 rounded-full animate-particle-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-particle-float" style={{animationDelay: '5s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-pulse"></div>
        
        {/* Subtle moving gradient - Blue */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/8 to-transparent animate-gradient-wave"></div>
        
        {/* Additional depth layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      </div>

      <AppHeader variant="dashboard" />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-pulse">
              Hackathon Evaluation
            </h1>
            <p className="text-gray-400">Upload multiple presentations for bulk evaluation and ranking</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 card-glow">
              <CardHeader>
                <CardTitle className="text-white">Hackathon Details</CardTitle>
                <CardDescription className="text-gray-400">
                  Provide information about your hackathon event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hackathonName" className="text-gray-300">Hackathon Name</Label>
                  <Input
                    id="hackathonName"
                    value={hackathonName}
                    onChange={(e) => setHackathonName(e.target.value)}
                    placeholder="Enter hackathon name"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tracks" className="text-gray-300">Tracks/Categories</Label>
                  <Input
                    id="tracks"
                    value={tracks}
                    onChange={(e) => setTracks(e.target.value)}
                    placeholder="e.g., Web Development, AI/ML, Mobile Apps"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="additionalInfo" className="text-gray-300">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Any specific evaluation criteria or context..."
                    rows={3}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
              </CardContent>
            </Card>



            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 card-glow">
              <CardHeader>
                <CardTitle className="text-white">Template Upload (Optional)</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a reference template to validate submissions against your expected format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!templateFile ? (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="templateFile"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-300">
                            <span className="font-semibold">Upload Template PDF</span>
                          </p>
                          <p className="text-xs text-gray-400">PDF (MAX. 10MB) - Optional reference format</p>
                        </div>
                        <input
                          id="templateFile"
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleTemplateFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-300">{templateFile.name}</p>
                            <p className="text-xs text-gray-400">Template uploaded</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeTemplateFile}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Template Analysis Status */}
                      <div className="p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          {templateAnalysisStatus === 'analyzing' && (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                              <span className="text-sm text-blue-400">Analyzing template structure...</span>
                            </>
                          )}
                          {templateAnalysisStatus === 'complete' && (
                            <>
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                              <span className="text-sm text-green-400">Template analysis complete</span>
                            </>
                          )}
                          {templateAnalysisStatus === 'error' && (
                            <>
                              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                <X className="w-2 h-2 text-white" />
                              </div>
                              <span className="text-sm text-red-400">Analysis failed</span>
                            </>
                          )}
                        </div>

                        {/* Template Structure Preview */}
                        {templateAnalysisStatus === 'complete' && templateAnalysis && (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-400">
                              <strong>Theme:</strong> {templateAnalysis.theme?.primaryTheme || 'Not detected'}
                            </div>
                            <div className="text-xs text-gray-400">
                              <strong>Structure:</strong> {templateAnalysis.structure?.totalSlides || 0} slides
                            </div>
                            {templateAnalysis.structure?.sections && templateAnalysis.structure.sections.length > 0 && (
                              <div className="text-xs text-gray-400">
                                <strong>Sections:</strong> {templateAnalysis.structure.sections.slice(0, 3).map((s: any) => s.title).join(', ')}
                                {templateAnalysis.structure.sections.length > 3 && '...'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 card-glow">
              <CardHeader>
                <CardTitle className="text-white">Evaluation Weights</CardTitle>
                <CardDescription className="text-gray-400">
                  Adjust the importance of each evaluation criterion (total must equal 100%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(weights).map(([criterion, weight]) => (
                  <div key={criterion}>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="capitalize text-gray-300">{criterion}</Label>
                      <span className="text-sm text-gray-400">{Math.round(weight)}%</span>
                    </div>
                    <Slider
                      value={[weight]}
                      onValueChange={(value) => handleWeightChange(criterion, value)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                ))}
                <div className="text-sm text-gray-400">
                  Total: {Math.round(Object.values(weights).reduce((sum, weight) => sum + weight, 0))}%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 card-glow">
              <CardHeader>
                <CardTitle className="text-white">Upload Presentations</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload up to 20 PDF presentation files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="files"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-300">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PDF (MAX. 10MB each)</p>
                      </div>
                      <input
                        id="files"
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-white">Selected Files ({files.length}/20)</h4>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-300">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300" 
              size="lg"
              disabled={!hackathonName || files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing {files.length} presentations...
                </>
              ) : (
                `Evaluate ${files.length} Presentations`
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}