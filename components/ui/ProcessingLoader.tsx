'use client'

import { useState, useEffect } from 'react'
import { FileText, Search, Lightbulb, BarChart3, CheckCircle } from 'lucide-react'

// Add custom CSS for animations
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(120deg); }
    66% { transform: translateY(5px) rotate(240deg); }
  }
  
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
`

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
  const [currentStep, setCurrentStep] = useState(-1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const steps = [
    { icon: FileText, text: "Reading presentation content", key: "reading" },
    { icon: Search, text: "Analyzing structure & flow", key: "analyzing" },
    { icon: Lightbulb, text: "Evaluating innovation & impact", key: "evaluating" },
    { icon: BarChart3, text: "Generating detailed scores", key: "scoring" }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let pollInterval: NodeJS.Timeout
    let stepTimeout: NodeJS.Timeout

    if (pollForCompletion && (evaluationId || hackathonId)) {
      // Real-time polling for actual completion
      const checkCompletion = async () => {
        try {
          // Use different endpoints for hackathon vs individual evaluation
          const endpoint = hackathonId ? `/api/hackathon/${hackathonId}` : `/api/evaluations/${evaluationId}`
          const response = await fetch(endpoint)
          if (response.ok) {
            const data = await response.json()
            if (data.status === 'completed') {
              // Mark all steps as completed and redirect immediately
              setCompletedSteps([0, 1, 2, 3])
              setCurrentStep(-1)
              setIsCompleted(true)
              onComplete?.()
              return true
            } else if (data.status === 'failed') {
              onComplete?.()
              return true
            }
          }
        } catch (error) {
          // Silently handle polling errors
        }
        return false
      }

      // Start step progression immediately
      let stepIndex = 0
      const progressSteps = () => {
        if (stepIndex < steps.length && !isCompleted) {
          setCurrentStep(stepIndex)
          
          stepTimeout = setTimeout(() => {
            if (!isCompleted) {
              // Complete current step and move to next
              setCompletedSteps(prev => [...prev, stepIndex])
              stepIndex++
              
              if (stepIndex < steps.length) {
                // Start next step immediately
                setCurrentStep(stepIndex)
                progressSteps()
              } else {
                // All steps done
                setCurrentStep(-1)
              }
            }
          }, 3000) // 3 seconds per step
        }
      }
      
      // Start immediately
      progressSteps()

      // Poll every 3 seconds for real-time updates
      pollInterval = setInterval(async () => {
        const completed = await checkCompletion()
        if (completed) {
          clearInterval(pollInterval)
          if (stepTimeout) clearTimeout(stepTimeout)
        }
      }, 3000)
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval)
      if (stepTimeout) clearTimeout(stepTimeout)
    }
  }, [evaluationId, hackathonId, pollForCompletion, mounted, onComplete, isCompleted])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/60 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Enhanced Loader */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 border-r-orange-400 rounded-full animate-spin"></div>
            
            {/* Middle ring */}
            <div className="absolute inset-2 border-2 border-gray-700 rounded-full"></div>
            <div className="absolute inset-2 border-2 border-transparent border-b-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
            
            {/* Inner pulsing core */}
            <div className="absolute inset-6 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-8 bg-white rounded-full animate-ping opacity-20"></div>
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{animationDuration: '4s'}}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full"></div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>

        {/* Enhanced Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-orange-200 to-blue-200 bg-clip-text text-transparent mb-3 animate-pulse">
            {isCompleted ? "🎉 Analysis Complete!" : message}
          </h2>
          <p className="text-gray-300 text-base leading-relaxed">
            {isCompleted ? "Preparing your detailed results..." : submessage}
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${((completedSteps.length + (currentStep >= 0 ? 0.5 : 0)) / steps.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Enhanced Processing Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = completedSteps.includes(index)
            const isActive = index === currentStep && !isCompleted
            
            return (
              <div 
                key={index}
                className={`relative flex items-center space-x-4 p-4 rounded-xl backdrop-blur-sm transition-all duration-700 transform ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500/20 to-blue-500/20 border-2 border-orange-500/50 scale-105 shadow-2xl shadow-orange-500/30' 
                    : isCompleted 
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 shadow-lg shadow-green-500/20' 
                    : 'bg-gray-900/40 border border-gray-700/50 opacity-60'
                }`}
              >
                {/* Animated background for active step */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-2xl animate-pulse"></div>
                )}
                
                <div className={`relative p-4 rounded-full transition-all duration-700 ${
                  isActive ? 'bg-gradient-to-r from-orange-500/40 to-blue-500/40 scale-110 shadow-lg' : 
                  isCompleted ? 'bg-gradient-to-r from-green-500/40 to-emerald-500/40 shadow-md' : 'bg-gray-700/60'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Icon className={`w-6 h-6 transition-all duration-700 ${
                      isActive ? 'text-orange-300 animate-pulse' : 'text-gray-500'
                    }`} />
                  )}
                  
                  {/* Glowing effect for active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-ping"></div>
                  )}
                </div>
                
                <div className="flex-1 relative">
                  <span className={`font-semibold text-lg transition-all duration-700 ${
                    isActive ? 'text-white' : 
                    isCompleted ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {step.text}
                  </span>
                  
                  {isActive && (
                    <div className="flex items-center mt-3 space-x-3">
                      <span className="text-orange-300 text-sm font-medium">Processing</span>
                      <div className="flex space-x-1">
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      
                      {/* Animated progress line */}
                      <div className="flex-1 h-0.5 bg-gray-700 rounded-full overflow-hidden ml-4">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  )}
                  
                  {isCompleted && (
                    <div className="text-green-300 text-sm mt-2 font-medium flex items-center">
                      <span className="mr-2">✓</span>
                      <span>Completed successfully</span>
                    </div>
                  )}
                </div>
                
                {/* Step number indicator */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isActive ? 'bg-orange-500 text-white' :
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </div>
            )
          })}
        </div>

        {/* Processing Time */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 text-gray-300 text-sm bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/50">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="font-medium">
              {isCompleted ? 'Analysis Complete' : `Processing... ${Math.max(0, 60 - (completedSteps.length * 15))}s remaining`}
            </span>
          </div>
          
          {/* Processing status */}
          <p className="text-gray-500 text-xs mt-3">
            {isCompleted ? 'Redirecting to results...' : `Step ${completedSteps.length + (currentStep >= 0 ? 1 : 0)} of ${steps.length}`}
          </p>
        </div>
      </div>
    </div>
    </>
  )
}