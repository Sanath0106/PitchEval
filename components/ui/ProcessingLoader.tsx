'use client'

import { useState, useEffect } from 'react'
import { FileText, Zap, Target, Lightbulb, BarChart3, CheckCircle } from 'lucide-react'

interface ProcessingLoaderProps {
  message?: string
  submessage?: string
  onComplete?: () => void
  evaluationId?: string
  pollForCompletion?: boolean
}

export default function ProcessingLoader({ 
  message = "Processing Your Presentation", 
  submessage = "Our AI is analyzing your presentation with Gemini. This may take 2-3 minutes...",
  onComplete,
  evaluationId,
  pollForCompletion = false
}: ProcessingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  const steps = [
    { icon: FileText, text: "Extracting content from slides", duration: 8000 },
    { icon: Target, text: "Analyzing presentation structure", duration: 12000 },
    { icon: Lightbulb, text: "Evaluating innovation and feasibility", duration: 15000 },
    { icon: BarChart3, text: "Calculating detailed scores", duration: 10000 },
    { icon: Zap, text: "Generating improvement suggestions", duration: 12000 }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let timeoutId: NodeJS.Timeout
    let pollInterval: NodeJS.Timeout

    if (pollForCompletion && evaluationId) {
      // Poll for actual completion
      const checkCompletion = async () => {
        try {
          const response = await fetch(`/api/evaluations/${evaluationId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.status === 'completed') {
              // Mark all steps as completed
              setCompletedSteps([0, 1, 2, 3, 4])
              setCurrentStep(5)
              setTimeout(() => {
                onComplete?.()
              }, 1000)
              return true
            } else if (data.status === 'failed') {
              // Handle failure
              setTimeout(() => {
                onComplete?.()
              }, 1000)
              return true
            }
          }
        } catch (error) {
          // Silently handle polling errors
        }
        return false
      }

      // Start polling every 3 seconds
      pollInterval = setInterval(async () => {
        const completed = await checkCompletion()
        if (completed) {
          clearInterval(pollInterval)
        }
      }, 3000)

      // Also run visual step progression
      const processStep = (stepIndex: number) => {
        if (stepIndex >= steps.length) return

        setCurrentStep(stepIndex)
        
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepIndex])
          processStep(stepIndex + 1)
        }, steps[stepIndex].duration)
      }

      processStep(0)
    } else {
      // Original fixed timing behavior
      const processStep = (stepIndex: number) => {
        if (stepIndex >= steps.length) {
          setTimeout(() => {
            onComplete?.()
          }, 2000)
          return
        }

        setCurrentStep(stepIndex)
        
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepIndex])
          processStep(stepIndex + 1)
        }, steps[stepIndex].duration)
      }

      processStep(0)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [steps, onComplete, evaluationId, pollForCompletion, mounted])

  // Calculate progress based on completed steps (deterministic, no Date.now())
  const totalSteps = steps.length
  const progress = mounted ? Math.min(((completedSteps.length + (currentStep < totalSteps ? 0.5 : 0)) / totalSteps) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-6">
        {/* Central Processing Animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            
            {/* Inner pulsing core */}
            <div className="absolute inset-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute inset-0">
              <div className="absolute top-2 left-8 w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="absolute top-8 right-4 w-1 h-1 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-6 left-4 w-1 h-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-2 right-8 w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-3xl font-bold text-white mb-2">
          {message}
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          {submessage}
        </p>

        {/* Processing Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = completedSteps.includes(index)
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-700 ${
                  isActive 
                    ? 'bg-gray-800/60 border-2 border-orange-500/40 scale-105 shadow-lg shadow-orange-500/20' 
                    : isCompleted 
                    ? 'bg-gray-800/40 border border-green-500/30' 
                    : 'bg-gray-800/20 border border-gray-700/30 opacity-50'
                }`}
              >
                <div className={`p-3 rounded-full transition-all duration-500 ${
                  isActive ? 'bg-orange-500/20 scale-110' : 
                  isCompleted ? 'bg-green-500/20' : 'bg-gray-700/50'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Icon className={`w-6 h-6 transition-all duration-500 ${
                      isActive ? 'text-orange-500 animate-pulse' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className={`font-medium text-lg transition-all duration-500 ${
                    isActive ? 'text-white' : 
                    isCompleted ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="flex items-center mt-1">
                      <span className="text-orange-400 text-sm mr-2">Processing</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="text-green-400 text-sm mt-1">✓ Completed</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-orange-500/30"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Estimated time */}
        <p className="text-gray-400 text-sm">
          Estimated time: 2-3 minutes • Powered by Google Gemini AI
        </p>
      </div>
    </div>
  )
}