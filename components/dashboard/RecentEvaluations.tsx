'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trophy, 
  Laptop, 
  Heart, 
  DollarSign, 
  GraduationCap, 
  Leaf, 
  Users, 
  Rocket,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import SimpleLoader from '@/components/ui/SimpleLoader'

interface Evaluation {
  _id: string
  type: 'personal' | 'hackathon'
  fileName?: string
  name?: string
  domain: string
  status: 'processing' | 'completed' | 'failed'
  scores?: {
    overall: number
  }
  evaluationCount?: number
  completedCount?: number
  createdAt: string
}

export default function RecentEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchRecentEvaluations = async () => {
      try {
        const response = await fetch('/api/evaluations/recent')
        if (response.ok) {
          const data = await response.json()
          setEvaluations(data.evaluations || [])
        }
      } catch (error) {
        // Silently handle fetch errors
      } finally {
        setLoading(false)
      }
    }

    fetchRecentEvaluations()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing...'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const getDomainIcon = (domain: string, type?: string, evaluation?: Evaluation) => {
    // Show trash icon for discarded files (0.0 score)
    if (evaluation?.status === 'completed' && evaluation?.scores?.overall === 0) {
      return <Trash2 className="w-6 h-6 text-red-500" />
    }
    
    if (type === 'hackathon') return <Trophy className="w-6 h-6 text-yellow-500" />
    
    const domainLower = domain.toLowerCase()
    if (domainLower.includes('tech') || domainLower.includes('software')) return <Laptop className="w-6 h-6 text-blue-500" />
    if (domainLower.includes('health') || domainLower.includes('medical')) return <Heart className="w-6 h-6 text-red-500" />
    if (domainLower.includes('finance') || domainLower.includes('fintech')) return <DollarSign className="w-6 h-6 text-green-500" />
    if (domainLower.includes('education') || domainLower.includes('learning')) return <GraduationCap className="w-6 h-6 text-purple-500" />
    if (domainLower.includes('environment') || domainLower.includes('green')) return <Leaf className="w-6 h-6 text-green-600" />
    if (domainLower.includes('social') || domainLower.includes('community')) return <Users className="w-6 h-6 text-indigo-500" />
    return <Rocket className="w-6 h-6 text-orange-500" />
  }

  const getDisplayName = (evaluation: Evaluation) => {
    if (evaluation.type === 'hackathon') {
      return evaluation.name || 'Hackathon Evaluation'
    }
    return evaluation.fileName || 'Personal Evaluation'
  }

  const getSubtitle = (evaluation: Evaluation) => {
    if (evaluation.type === 'hackathon') {
      return `${evaluation.completedCount}/${evaluation.evaluationCount} evaluations completed`
    }
    return evaluation.domain
  }

  const getViewLink = (evaluation: Evaluation) => {
    if (evaluation.type === 'hackathon') {
      return `/dashboard/hackathon/results/${evaluation._id}`
    }
    return `/dashboard/results/${evaluation._id}`
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
        <CardContent className="p-6">
          <div className="py-8">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-spin relative shadow-lg shadow-orange-500/25">
                <div className="absolute top-1.5 left-1.5 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-pulse"></div>
              </div>
              <p className="text-gray-400 ml-4">Loading recent evaluations...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (evaluations.length === 0) {
    return (
      <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No evaluations yet. Start by uploading your first presentation!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          {(showAll ? evaluations : evaluations.slice(0, 5)).map((evaluation) => (
            <div
              key={evaluation._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-orange-500/50 hover:bg-gray-700/60 transition-all duration-300 group space-y-3 sm:space-y-0"
            >
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  {getDomainIcon(evaluation.domain, evaluation.type, evaluation)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-white truncate">
                    {getDisplayName(evaluation)}
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm text-gray-400">
                    <span className="truncate">{getSubtitle(evaluation)}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs sm:text-sm">{new Date(evaluation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 flex-shrink-0">
                {evaluation.status === 'completed' && evaluation.scores && evaluation.type === 'personal' && (
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      evaluation.scores.overall === 0 ? 'text-red-500' : 'text-orange-500'
                    }`}>
                      {evaluation.scores.overall.toFixed(1)}/10
                    </div>
                    <div className="text-xs text-gray-400">
                      {evaluation.scores.overall === 0 ? 'Discarded' : 'Overall Score'}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {getStatusIcon(evaluation.status)}
                  <span className="text-sm text-gray-300 hidden sm:inline">
                    {evaluation.status === 'completed' && evaluation.scores?.overall === 0 
                      ? 'Discarded' 
                      : getStatusText(evaluation.status)
                    }
                  </span>
                </div>

                {/* Only show View button for valid evaluations (not discarded) */}
                {(evaluation.status === 'completed' || evaluation.type === 'hackathon') && 
                 !(evaluation.status === 'completed' && evaluation.scores?.overall === 0) && (
                  <Link href={getViewLink(evaluation)}>
                    <Button size="sm" variant="orange" className="flex-shrink-0">
                      <Eye className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {evaluations.length > 5 && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'View All Evaluations'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}