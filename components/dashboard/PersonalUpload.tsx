'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, Loader2 } from 'lucide-react'
import ProcessingLoader from '@/components/ui/ProcessingLoader'
import Logo from '@/components/ui/Logo'

export default function PersonalUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [domain, setDomain] = useState('')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a PDF file only.')
        e.target.value = '' // Clear the input
        return
      }
      
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.')
        e.target.value = '' // Clear the input
        return
      }
      
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('domain', domain)
    formData.append('description', description)

    try {
      const response = await fetch('/api/evaluate/personal', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        // Handle success - redirect to results page
        window.location.href = `/dashboard/results/${result.evaluationId}`
      } else {
        // Handle upload failure silently
      }
    } catch (error) {
      // Handle upload error silently
    } finally {
      setIsUploading(false)
    }
  }

  if (isUploading) {
    return (
      <ProcessingLoader 
        message="Processing Your Presentation"
        submessage="Our AI is analyzing your presentation with Gemini. This may take 2-3 minutes..."
        onComplete={() => {
          // This will be handled by the upload success redirect
          setIsUploading(false)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Orange Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated gradient orbs - Orange theme */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl animate-gradient-shift"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-60 right-1/3 w-64 h-64 bg-yellow-500/6 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '6s'}}></div>
        
        {/* Floating particles - Orange theme */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/50 rounded-full animate-particle-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-300/40 rounded-full animate-particle-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-red-400/40 rounded-full animate-particle-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-yellow-400/30 rounded-full animate-particle-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-orange-500/40 rounded-full animate-particle-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-orange-300/30 rounded-full animate-particle-float" style={{animationDelay: '5s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-pulse"></div>
        
        {/* Subtle moving gradient - Orange */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/8 to-transparent animate-gradient-wave"></div>
        
        {/* Additional depth layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.05),transparent_70%)]"></div>
      </div>

      <header className="relative z-10 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <UserButton />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent animate-pulse">
              Personal Evaluation
            </h1>
            <p className="text-gray-400">Upload your presentation for AI-powered analysis and feedback</p>
          </div>

          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 card-glow">
            <CardHeader>
              <CardTitle className="text-white">Upload Your Presentation</CardTitle>
              <CardDescription className="text-gray-400">
                Supported format: PDF (Max size: 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="file" className="text-gray-300">Presentation File</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {file ? (
                            <>
                              <FileText className="w-8 h-8 mb-2 text-orange-500" />
                              <p className="text-sm text-gray-300">{file.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-300">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-400">PDF (MAX. 10MB)</p>
                            </>
                          )}
                        </div>
                        <input
                          id="file"
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="domain" className="text-gray-300">Project Domain/Track</Label>
                  <Select value={domain} onValueChange={setDomain} required>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select project domain" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                      <SelectItem value="web-development" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Web Development</SelectItem>
                      <SelectItem value="mobile-app" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Mobile App Development</SelectItem>
                      <SelectItem value="ai-ml" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">AI/Machine Learning</SelectItem>
                      <SelectItem value="data-science" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Data Science & Analytics</SelectItem>
                      <SelectItem value="blockchain" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Blockchain & Web3</SelectItem>
                      <SelectItem value="cybersecurity" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Cybersecurity</SelectItem>
                      <SelectItem value="iot" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Internet of Things (IoT)</SelectItem>
                      <SelectItem value="ar-vr" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">AR/VR & Metaverse</SelectItem>
                      <SelectItem value="fintech" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">FinTech</SelectItem>
                      <SelectItem value="healthtech" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">HealthTech & MedTech</SelectItem>
                      <SelectItem value="edtech" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">EdTech</SelectItem>
                      <SelectItem value="cleantech" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">CleanTech & Sustainability</SelectItem>
                      <SelectItem value="agritech" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">AgriTech</SelectItem>
                      <SelectItem value="gaming" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Gaming & Entertainment</SelectItem>
                      <SelectItem value="social-impact" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Social Impact</SelectItem>
                      <SelectItem value="e-commerce" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">E-commerce & Retail</SelectItem>
                      <SelectItem value="logistics" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Logistics & Supply Chain</SelectItem>
                      <SelectItem value="robotics" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Robotics & Automation</SelectItem>
                      <SelectItem value="devtools" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Developer Tools</SelectItem>
                      <SelectItem value="other" className="text-white hover:bg-orange-500/40 focus:bg-orange-500/40 data-[highlighted]:bg-orange-500/40 hover:border-l-4 hover:border-orange-500 focus:border-l-4 focus:border-orange-500 data-[highlighted]:border-l-4 data-[highlighted]:border-orange-500">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Additional Information (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide any additional context about your project..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="orange"
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Presentation...
                    </>
                  ) : (
                    'Evaluate Presentation'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}