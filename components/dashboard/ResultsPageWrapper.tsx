'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import ResultsPage from './ResultsPage'
import SimpleLoader from '@/components/ui/SimpleLoader'

interface EvaluationData {
  _id: string
  fileName: string
  domain: string
  hackathonId?: string
  status: 'processing' | 'completed' | 'failed'
  scores?: {
    feasibility: number
    innovation: number
    impact: number
    clarity: number
    overall: number
  }
  suggestions?: string[]
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
  createdAt: string
}

interface ResultsPageWrapperProps {
  evaluationId: string
}

export default function ResultsPageWrapper({ evaluationId }: ResultsPageWrapperProps) {
  const { user } = useUser()
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && evaluationId) {
      fetchEvaluation()
    }
  }, [user, evaluationId])

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`)

      if (response.ok) {
        const data = await response.json()
        setEvaluation(data)

        // If still processing, poll again in 2 seconds
        if (data.status === 'processing') {
          setTimeout(fetchEvaluation, 2000)
          return // Don't set loading to false yet
        }
      } else {
        setEvaluation(null)
      }
    } catch (error) {
      setEvaluation(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <SimpleLoader message="Loading evaluation..." />
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Evaluation not found</p>
        </div>
      </div>
    )
  }

  return <ResultsPage evaluation={evaluation} />
}