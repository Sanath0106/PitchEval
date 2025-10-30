'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Home, Trophy, Medal, Award } from 'lucide-react'
import Link from 'next/link'
import ProcessingLoader from '@/components/ui/ProcessingLoader'
import AppHeader from '@/components/ui/AppHeader'

interface HackathonEvaluation {
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
  trackRelevance?: {
    isRelevant: boolean
    matchedTracks: string[]
    relevanceScore: number
    reason: string
  }
  templateValidation?: {
    themeMatch: {
      score: number
      reasoning: string
    }
    structureAdherence: {
      score: number
      deviations: string[]
    }
    overallCompliance: number
  }
  rank?: number
  createdAt: string
}

interface HackathonData {
  _id: string
  name: string
  status: 'processing' | 'completed' | 'failed'
  evaluations: HackathonEvaluation[]
  weights: {
    innovation: number
    feasibility: number
    impact: number
    clarity: number
  }
}

export default function HackathonResultsPage() {
  const params = useParams()
  const [hackathon, setHackathon] = useState<HackathonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !params.id) return

    const fetchHackathonResults = async () => {
      try {
        const response = await fetch(`/api/hackathon/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setHackathon(data)
        } else {
          setError('Hackathon not found')
        }
      } catch (err) {
        setError('Failed to load hackathon results')
      } finally {
        setLoading(false)
      }
    }

    fetchHackathonResults()
  }, [params.id, mounted])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-spin relative shadow-lg shadow-orange-500/25">
          <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-pulse"></div>
        </div>
      </div>
    )
  }

  const handleDownloadResults = async () => {
    try {
      const response = await fetch(`/api/hackathon/${params.id}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${hackathon?.name}_results.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      // Silently handle download errors
    }
  }

  if (loading) {
    return (
      <ProcessingLoader 
        message="Loading Hackathon Results"
        submessage="Fetching evaluation data and rankings..."
      />
    )
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'Hackathon not found'}</p>
          <Link href="/dashboard">
            <Button variant="orange">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedEvaluations = hackathon.evaluations.filter(e => e.status === 'completed')
  const processingEvaluations = hackathon.evaluations.filter(e => e.status === 'processing')
  const failedEvaluations = hackathon.evaluations.filter(e => e.status === 'failed')
  
  // Separate relevant and discarded evaluations
  const relevantEvaluations = completedEvaluations.filter(e => 
    !e.trackRelevance || e.trackRelevance.isRelevant !== false
  )
  const discardedEvaluations = completedEvaluations.filter(e => 
    e.trackRelevance && e.trackRelevance.isRelevant === false
  )

  // Calculate template compliance statistics
  const evaluationsWithTemplate = relevantEvaluations.filter(e => e.templateValidation)
  const highCompliance = evaluationsWithTemplate.filter(e => 
    e.templateValidation?.overallCompliance !== undefined && e.templateValidation.overallCompliance >= 8
  ).length
  const mediumCompliance = evaluationsWithTemplate.filter(e => 
    e.templateValidation?.overallCompliance !== undefined && 
    e.templateValidation.overallCompliance >= 6 && e.templateValidation.overallCompliance < 8
  ).length
  const lowCompliance = evaluationsWithTemplate.filter(e => 
    e.templateValidation?.overallCompliance !== undefined && e.templateValidation.overallCompliance < 6
  ).length
  const averageCompliance = evaluationsWithTemplate.length > 0 
    ? evaluationsWithTemplate
        .filter(e => e.templateValidation?.overallCompliance !== undefined)
        .reduce((sum, e) => sum + e.templateValidation!.overallCompliance, 0) / 
      evaluationsWithTemplate.filter(e => e.templateValidation?.overallCompliance !== undefined).length
    : 0

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{rank}</span>
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              {hackathon.name}
            </h1>
            <p className="text-gray-400">Hackathon Evaluation Results</p>
          </div>

          {/* Status Overview - Only show cards with actual items */}
          {(relevantEvaluations.length > 0 || processingEvaluations.length > 0 || failedEvaluations.length > 0 || discardedEvaluations.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {relevantEvaluations.length > 0 && (
                <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 card-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">{relevantEvaluations.length}</div>
                    <div className="text-gray-400">Successfully Evaluated</div>
                  </CardContent>
                </Card>
              )}
              
              {discardedEvaluations.length > 0 && (
                <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 card-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-2">{discardedEvaluations.length}</div>
                    <div className="text-gray-400">Track Mismatch</div>
                  </CardContent>
                </Card>
              )}
              
              {processingEvaluations.length > 0 && (
                <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 card-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-yellow-500 mb-2">{processingEvaluations.length}</div>
                    <div className="text-gray-400">Currently Processing</div>
                  </CardContent>
                </Card>
              )}
              
              {failedEvaluations.length > 0 && (
                <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 card-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-red-500 mb-2">{failedEvaluations.length}</div>
                    <div className="text-gray-400">Processing Failed</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Template Compliance Statistics */}
          {evaluationsWithTemplate.length > 0 && (
            <Card className="mb-8 bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 card-glow">
              <CardHeader>
                <CardTitle className="text-white">Template Compliance Overview</CardTitle>
                <CardDescription className="text-gray-400">
                  How well submissions followed the provided template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {averageCompliance.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-gray-400">Average Compliance</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-500 mb-2">{highCompliance}</div>
                    <div className="text-sm text-gray-400">High Compliance (8+)</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500 mb-2">{mediumCompliance}</div>
                    <div className="text-sm text-gray-400">Medium Compliance (6-8)</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-500 mb-2">{lowCompliance}</div>
                    <div className="text-sm text-gray-400">Low Compliance (&lt;6)</div>
                  </div>
                </div>

                {/* Highlight submissions with significant deviations */}
                {evaluationsWithTemplate.filter(e => 
                  e.templateValidation?.overallCompliance !== undefined && e.templateValidation.overallCompliance < 6
                ).length > 0 && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Submissions with Significant Template Deviations</h4>
                    <div className="space-y-2">
                      {evaluationsWithTemplate
                        .filter(e => e.templateValidation?.overallCompliance !== undefined && e.templateValidation.overallCompliance < 6)
                        .map(evaluation => (
                          <div key={evaluation._id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">{evaluation.fileName}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-red-400">
                                {evaluation.templateValidation!.overallCompliance.toFixed(1)}/10
                              </span>
                              <Link href={`/dashboard/results/${evaluation._id}`}>
                                <Button size="sm" variant="outline" className="text-xs border-red-500/50 text-red-400 hover:bg-red-500/20">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Rankings */}
          {relevantEvaluations.length > 0 && (
            <Card className="mb-8 bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 card-glow">
              <CardHeader>
                <CardTitle className="text-white">Final Rankings</CardTitle>
                <CardDescription className="text-gray-400">
                  Track-relevant presentations ranked by weighted overall score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relevantEvaluations
                    .sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0))
                    .map((evaluation, index) => (
                      <div key={evaluation._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            {getRankIcon(index + 1)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-white truncate">{evaluation.fileName}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm text-gray-400 space-y-1 sm:space-y-0">
                              {evaluation.trackRelevance?.matchedTracks && evaluation.trackRelevance.matchedTracks.length > 0 && (
                                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs inline-block w-fit">
                                  {evaluation.trackRelevance.matchedTracks.join(', ')}
                                </span>
                              )}
                              <span className="text-xs sm:text-sm">{new Date(evaluation.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-6 flex-shrink-0">
                          {/* Template Compliance Column */}
                          {evaluation.templateValidation && evaluation.templateValidation.overallCompliance !== undefined && (
                            <div className="text-right min-w-[80px]">
                              <div className="text-sm font-semibold text-blue-400">
                                {evaluation.templateValidation.overallCompliance.toFixed(1)}/10
                              </div>
                              <div className="text-xs text-gray-400">Template</div>
                              {/* Enhanced visual indicator for template compliance */}
                              <div className="mt-1 flex items-center justify-center">
                                {evaluation.templateValidation.overallCompliance >= 8 && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs text-green-400">High</span>
                                  </div>
                                )}
                                {evaluation.templateValidation.overallCompliance >= 6 && evaluation.templateValidation.overallCompliance < 8 && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-xs text-yellow-400">Med</span>
                                  </div>
                                )}
                                {evaluation.templateValidation.overallCompliance < 6 && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-xs text-red-400">Low</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {(!evaluation.templateValidation || evaluation.templateValidation.overallCompliance === undefined) && (
                            <div className="text-right min-w-[80px]">
                              <div className="text-sm text-gray-500">N/A</div>
                              <div className="text-xs text-gray-400">Template</div>
                            </div>
                          )}
                          
                          <div className="text-right min-w-[80px]">
                            <div className="text-lg font-semibold text-orange-500">
                              {evaluation.scores?.overall.toFixed(1)}/10
                            </div>
                            <div className="text-xs text-gray-400">Overall Score</div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="orange" 
                            className="bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
                            onClick={async () => {
                              try {
                                const response = await fetch(`/api/judge-reports/${evaluation._id}`)
                                if (response.ok) {
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `${evaluation.fileName.replace(/\.[^/.]+$/, '')}_Judge_Report.pdf`
                                  document.body.appendChild(a)
                                  a.click()
                                  document.body.removeChild(a)
                                  window.URL.revokeObjectURL(url)
                                }
                              } catch (error) {
                                console.error('Download failed:', error)
                              }
                            }}
                          >
                            <span className="hidden sm:inline">Judge Report</span>
                            <span className="sm:hidden">Report</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discarded Section */}
          {discardedEvaluations.length > 0 && (
            <Card className="mb-8 bg-gray-900/50 border-red-700/30">
              <CardHeader>
                <CardTitle className="text-red-400">Discarded Submissions</CardTitle>
                <CardDescription className="text-gray-400">
                  Presentations that don't match the hackathon tracks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discardedEvaluations.map((evaluation) => (
                    <div key={evaluation._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/20 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-red-400 text-sm">✕</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-white truncate">{evaluation.fileName}</h4>
                          <p className="text-sm text-red-400 break-words">
                            {evaluation.trackRelevance?.reason || 'Does not match hackathon tracks'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Disqualified</div>
                          <div className="text-xs text-gray-400">Track Mismatch</div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-500 text-red-400 hover:bg-red-500/20 bg-red-500/10 flex-shrink-0"
                          onClick={() => {
                            alert(`Disqualification Reason:\n\n${evaluation.trackRelevance?.reason || evaluation.suggestions?.[0] || 'Does not match hackathon tracks or requirements'}`)
                          }}
                        >
                          <span className="hidden sm:inline">View Reason</span>
                          <span className="sm:hidden">Why</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Status */}
          {processingEvaluations.length > 0 && (
            <Card className="mb-8 bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Still Processing</CardTitle>
                <CardDescription className="text-gray-400">
                  These presentations are still being evaluated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {processingEvaluations.map((evaluation) => (
                    <div key={evaluation._id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <span className="text-gray-300">{evaluation.fileName}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-yellow-500">Processing...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 bg-gray-900/80 backdrop-blur-sm">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            {(relevantEvaluations.length > 0 || discardedEvaluations.length > 0) && (
              <Button onClick={handleDownloadResults} variant="orange" size="lg" className="w-full sm:w-auto shadow-lg shadow-orange-500/25">
                <Download className="w-4 h-4 mr-2" />
                Download Results (CSV)
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}