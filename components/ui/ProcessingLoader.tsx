'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Lightbulb, BarChart3, CheckCircle } from 'lucide-react'

interface ProcessingLoaderProps {
  message?: string
  submessage?: string
  onComplete?: () => void
  evaluationId?: string
  hackathonId?: string
  pollForCompletion?: boolean
}

export default function ProcessingLoader({ 
  message = "AI Analysis in Progress", 
  submessage = "Analyzing your presentation with Gemini AI...",
  onComplete,
  evaluationId,
  hackathonId,
  pollForCompletion = false
}: ProcessingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const [isPolling, setIsPolling] = useState(false)

  const steps = [
    { 
      icon: FileText, 
      text: "Reading presentation content", 
      key: "reading",
      description: "Extracting text and analyzing document structure"
    },
    { 
      icon: Search, 
      text: "Analyzing structure & flow", 
      key: "analyzing",
      description: "Evaluating presentation organization and narrative"
    },
    { 
      icon: Lightbulb, 
      text: "Evaluating innovation & impact", 
      key: "evaluating",
      description: "Assessing project uniqueness and market potential"
    },
    { 
      icon: BarChart3, 
      text: "Generating detailed scores", 
      key: "scoring",
      description: "Computing final scores and improvement suggestions"
    }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let pollInterval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    if (pollForCompletion && (evaluationId || hackathonId) && !isPolling) {
      setIsPolling(true)
      
      // Smart completion checking with better error handling
      const checkCompletion = async () => {
        if (isCompleted) return true // Already completed, stop polling
        
        try {
          // Use different endpoints for hackathon vs individual evaluation
          const endpoint = hackathonId ? `/api/hackathon/${hackathonId}` : `/api/evaluations/${evaluationId}`
          console.log(`Polling for completion: ${endpoint}`)
          
          const response = await fetch(endpoint)
          if (response.ok) {
            const data = await response.json()
            console.log(`Poll #${pollAttempts} result:`, { 
              status: data.status, 
              id: evaluationId || hackathonId,
              hasScores: !!data.scores,
              updatedAt: data.updatedAt 
            })
            
            if (data.status === 'completed') {
              // Complete all remaining steps smoothly
              setCompletedSteps([0, 1, 2, 3])
              setCurrentStep(-1)
              setStepProgress(100)
              setOverallProgress(100)
              setIsCompleted(true)
              setIsPolling(false)
              console.log('Evaluation completed - stopping all polling')
              
              // Redirect after showing completion
              setTimeout(() => {
                onComplete?.()
              }, 2000)
              return true
            } else if (data.status === 'failed') {
              console.log('Evaluation failed - stopping polling')
              setIsCompleted(true)
              setIsPolling(false)
              onComplete?.()
              return true
            }
          } else {
            console.log(`Poll failed with status: ${response.status}`)
          }
        } catch (error) {
          console.log('Poll error:', error)
          // Continue polling on errors, but with backoff
        }
        return false
      }

      // Smooth step progression with reliable state management
      const processStep = (stepIndex: number) => {
        if (stepIndex >= steps.length || isCompleted) return
        
        setCurrentStep(stepIndex)
        setStepProgress(0)
        
        // Smooth progress animation for current step
        let progress = 0
        const stepDuration = 3000 + Math.random() * 1000 // 3-4 seconds per step
        const progressIncrement = 100 / (stepDuration / 100) // Update every 100ms
        
        if (progressInterval) clearInterval(progressInterval)
        progressInterval = setInterval(() => {
          if (isCompleted) {
            clearInterval(progressInterval)
            return
          }
          
          progress += progressIncrement
          
          if (progress >= 100) {
            progress = 100
            setStepProgress(100)
            clearInterval(progressInterval)
            
            // Mark step as completed and move to next
            setTimeout(() => {
              if (!isCompleted) {
                setCompletedSteps(prev => {
                  if (!prev.includes(stepIndex)) {
                    return [...prev, stepIndex]
                  }
                  return prev
                })
                setOverallProgress(((stepIndex + 1) / steps.length) * 100)
                
                // Move to next step or complete
                const nextStep = stepIndex + 1
                if (nextStep < steps.length) {
                  setTimeout(() => {
                    processStep(nextStep)
                  }, 500)
                } else {
                  // All steps completed - ensure 100% progress
                  setOverallProgress(100)
                  setStepProgress(100)
                }
              }
            }, 300)
          } else {
            setStepProgress(progress)
            setOverallProgress(((stepIndex + progress / 100) / steps.length) * 100)
          }
        }, 100) // Slower updates for smoother animation
      }
      
      // Start with the first step
      processStep(0)

      // Poll with exponential backoff - start at 5s, max 15s
      let pollDelay = 5000 // Start with 5 seconds
      const maxPollDelay = 15000 // Max 15 seconds
      let pollAttempts = 0
      const maxPollAttempts = 15 // Stop after ~10 minutes max
      const startTime = Date.now()
      const maxPollTime = 10 * 60 * 1000 // 10 minutes absolute maximum
      
      const schedulePoll = () => {
        const elapsed = Date.now() - startTime
        if (pollAttempts >= maxPollAttempts || isCompleted || elapsed > maxPollTime) {
          console.log(`Polling stopped: attempts=${pollAttempts}, completed=${isCompleted}, elapsed=${elapsed}ms`)
          setIsPolling(false)
          
          // If we've been polling for a long time, assume it's completed
          if (elapsed > maxPollTime || pollAttempts >= maxPollAttempts) {
            console.log('Polling timeout - assuming completion and redirecting')
            setCompletedSteps([0, 1, 2, 3])
            setCurrentStep(-1)
            setStepProgress(100)
            setOverallProgress(100)
            setIsCompleted(true)
            setTimeout(() => onComplete?.(), 2000)
          }
          return
        }
        
        pollInterval = setTimeout(async () => {
          pollAttempts++
          const completed = await checkCompletion()
          if (completed) {
            clearTimeout(pollInterval)
            setIsPolling(false)
          } else {
            // Exponential backoff: increase delay gradually
            pollDelay = Math.min(pollDelay * 1.2, maxPollDelay)
            schedulePoll()
          }
        }, pollDelay)
      }
      
      // Initial check before starting polling
      const initialCheck = async () => {
        console.log('Performing initial completion check...')
        const completed = await checkCompletion()
        if (!completed && !isCompleted) {
          console.log('Starting polling schedule...')
          setTimeout(() => {
            if (!isCompleted) schedulePoll()
          }, 8000) // Wait 8 seconds before first poll to allow processing
        } else {
          console.log('Evaluation already completed - skipping polling')
          setIsPolling(false)
        }
      }
      
      // Start with initial check
      initialCheck()
    }

    return () => {
      if (pollInterval) clearTimeout(pollInterval)
      if (progressInterval) clearInterval(progressInterval)
      setIsPolling(false)
    }
  }, [evaluationId, hackathonId, pollForCompletion, mounted, onComplete])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-2 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-xl font-medium text-white mb-2">
            {isCompleted ? "Analysis Complete" : message}
          </h2>
          <p className="text-gray-400 text-sm">
            {isCompleted ? "Preparing your results..." : submessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div 
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Simple Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(index)
            const isActive = index === currentStep && !isCompleted
            
            return (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-gray-900 border border-orange-500/30' : 
                  isCompleted ? 'bg-gray-900 border border-green-500/30' : 
                  'bg-gray-900/50 border border-gray-800'
                }`}
              >
                <div className={`p-1.5 rounded-full ${
                  isActive ? 'bg-orange-500/20' : 
                  isCompleted ? 'bg-green-500/20' : 'bg-gray-800'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-orange-400' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    isActive ? 'text-white' : 
                    isCompleted ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {step.text}
                  </div>
                  
                  {(isActive || isCompleted) && (
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-gray-300' : 
                      isCompleted ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {isCompleted ? '✓ Completed successfully' : step.description}
                    </div>
                  )}
                  
                  {isActive && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-800 rounded-full h-1">
                        <div 
                          className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${stepProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  isActive ? 'bg-orange-500 text-white' :
                  isCompleted ? 'bg-green-500 text-white' : 
                  'bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
              </div>
            )
          })}
        </div>

        {/* Status Footer */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-2 text-xs text-gray-400">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isCompleted ? 'bg-green-400' : 'bg-orange-400 animate-pulse'
            }`}></div>
            <span>
              {isCompleted ? 'Analysis complete • Redirecting to results...' : 
               currentStep < steps.length ? 
                 `${steps[currentStep]?.text} • Step ${currentStep + 1} of ${steps.length}` :
                 'Processing...'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}