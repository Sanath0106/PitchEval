'use client'

import { UserButton } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Download, CheckCircle, XCircle, Home } from 'lucide-react'
import Link from 'next/link'
import ProcessingLoader from '@/components/ui/ProcessingLoader'
import Logo from '@/components/ui/Logo'

interface EvaluationData {
  _id: string
  fileName: string
  domain: string
  status: 'processing' | 'completed' | 'failed'
  scores?: {
    feasibility: number
    innovation: number
    impact: number
    clarity: number
    overall: number
  }
  suggestions?: string[]
  createdAt: string
}

interface ResultsPageProps {
  evaluation: EvaluationData
}

export default function ResultsPage({ evaluation }: ResultsPageProps) {
  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`/api/reports/${evaluation._id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${evaluation.fileName}_evaluation_report.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      // Silently handle download errors
    }
  }

  if (evaluation.status === 'processing') {
    return (
      <ProcessingLoader 
        message="Processing Your Presentation"
        submessage="Our AI is analyzing your presentation with Gemini. This may take 2-3 minutes..."
        evaluationId={evaluation._id}
        pollForCompletion={true}
        onComplete={() => {
          // Refresh the page to show results
          window.location.reload()
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent animate-pulse">
              Evaluation Results
            </h1>
            <p className="text-gray-400">{evaluation.fileName}</p>
          </div>



          {evaluation.status === 'failed' && (
            <Card className="mb-8 bg-gray-900/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Processing Failed</h3>
                <p className="text-gray-400">There was an error processing your presentation. Please try uploading again.</p>
                <Link href="/dashboard/personal">
                  <Button className="mt-4" variant="orange">
                    Try Again
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {evaluation.status === 'completed' && evaluation.scores && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 card-glow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Overall Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-500 mb-2">
                        {evaluation.scores.overall.toFixed(1)}/10
                      </div>
                      <Progress value={evaluation.scores.overall * 10} className="w-full" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 card-glow">
                  <CardHeader>
                    <CardTitle className="text-white">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Domain:</span> {evaluation.domain}
                      </div>
                      <div className="text-gray-300">
                        <span className="font-medium text-white">Evaluated:</span>{' '}
                        {new Date(evaluation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8 bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 card-glow">
                <CardHeader>
                  <CardTitle className="text-white">Detailed Scores</CardTitle>
                  <CardDescription className="text-gray-400">
                    Breakdown of your presentation evaluation across key criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Feasibility</span>
                        <span className="text-sm text-gray-400">
                          {evaluation.scores.feasibility}/10
                        </span>
                      </div>
                      <Progress value={evaluation.scores.feasibility * 10} className="mb-4" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Innovation</span>
                        <span className="text-sm text-gray-400">
                          {evaluation.scores.innovation}/10
                        </span>
                      </div>
                      <Progress value={evaluation.scores.innovation * 10} className="mb-4" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Impact</span>
                        <span className="text-sm text-gray-400">
                          {evaluation.scores.impact}/10
                        </span>
                      </div>
                      <Progress value={evaluation.scores.impact * 10} className="mb-4" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Clarity</span>
                        <span className="text-sm text-gray-400">
                          {evaluation.scores.clarity}/10
                        </span>
                      </div>
                      <Progress value={evaluation.scores.clarity * 10} className="mb-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                <Card className="mb-8 bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 card-glow">
                  <CardHeader>
                    <CardTitle className="text-white">Improvement Suggestions</CardTitle>
                    <CardDescription className="text-gray-400">
                      AI-generated recommendations to enhance your presentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {evaluation.suggestions.map((suggestion, index) => {
                        const getSuggestionType = (text: string) => {
                          if (text.startsWith('WHAT TO REMOVE:')) return 'critical'
                          if (text.startsWith('WHAT TO IMPROVE:')) return 'warning'
                          if (text.startsWith('WHAT TO ADD:')) return 'success'
                          return 'info'
                        }
                        
                        const suggestionType = getSuggestionType(suggestion)
                        const typeConfig = {
                          critical: {
                            bgColor: 'bg-gray-800/30',
                            borderColor: 'border-gray-600',
                            iconBg: 'bg-gray-700',
                            iconColor: 'text-white',
                            textColor: 'text-gray-100',
                            label: 'CRITICAL',
                            labelBg: 'bg-gray-700'
                          },
                          warning: {
                            bgColor: 'bg-gray-800/30',
                            borderColor: 'border-gray-600',
                            iconBg: 'bg-gray-700',
                            iconColor: 'text-white',
                            textColor: 'text-gray-100',
                            label: 'IMPROVE',
                            labelBg: 'bg-gray-700'
                          },
                          success: {
                            bgColor: 'bg-gray-800/30',
                            borderColor: 'border-gray-600',
                            iconBg: 'bg-gray-700',
                            iconColor: 'text-white',
                            textColor: 'text-gray-100',
                            label: 'ADD',
                            labelBg: 'bg-gray-700'
                          },
                          info: {
                            bgColor: 'bg-gray-800/30',
                            borderColor: 'border-gray-600',
                            iconBg: 'bg-gray-700',
                            iconColor: 'text-white',
                            textColor: 'text-gray-100',
                            label: 'INFO',
                            labelBg: 'bg-gray-700'
                          }
                        }
                        
                        const config = typeConfig[suggestionType]
                        
                        return (
                          <div 
                            key={index} 
                            className={`suggestion-card suggestion-${suggestionType} p-6 rounded-xl border-2 ${config.bgColor} ${config.borderColor}`}
                          >
                            <div className="flex items-start space-x-5">
                              <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                                <span className={`${config.iconColor} text-lg font-bold`}>{index + 1}</span>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className={`inline-block px-3 py-1 ${config.labelBg} rounded-full text-xs font-semibold text-white`}>
                                  {config.label}
                                </div>
                                <p className={`${config.textColor} leading-relaxed text-base font-medium`}>
                                  {suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black bg-gray-800/50">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Button onClick={handleDownloadReport} variant="orange" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}