'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, RefreshCw, Activity, Clock, CheckCircle } from 'lucide-react'

interface QueueStats {
  queueName: string
  messageCount: number
  consumerCount: number
  isEmpty: boolean
}

interface ProcessingResult {
  success: boolean
  processedJobs: number
  processingTime: number
  remainingJobs: number
  hasMoreJobs: boolean
  message: string
}

export default function QueueMonitor() {
  const [personalQueue, setPersonalQueue] = useState<QueueStats | null>(null)
  const [hackathonQueue, setHackathonQueue] = useState<QueueStats | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [healthStatus, setHealthStatus] = useState<any>(null)

  const fetchQueueStats = async () => {
    try {
      const [personalRes, hackathonRes, healthRes] = await Promise.all([
        fetch('/api/queue/process?queue=personal_evaluation'),
        fetch('/api/queue/process?queue=hackathon_evaluation'),
        fetch('/api/queue/health')
      ])

      if (personalRes.ok) {
        const personalData = await personalRes.json()
        setPersonalQueue(personalData)
      }

      if (hackathonRes.ok) {
        const hackathonData = await hackathonRes.json()
        setHackathonQueue(hackathonData)
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setHealthStatus(healthData)
      }
    } catch (error) {
      console.error('Failed to fetch queue stats:', error)
    }
  }

  const triggerProcessing = async (queueName: string, maxJobs: number = 10) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/queue/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ queueName, maxJobs })
      })

      if (response.ok) {
        const result = await response.json()
        setLastResult(result)
        // Refresh stats after processing
        setTimeout(fetchQueueStats, 1000)
      }
    } catch (error) {
      console.error('Failed to trigger processing:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    fetchQueueStats()
    
    if (autoRefresh) {
      const interval = setInterval(fetchQueueStats, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const QueueCard = ({ 
    title, 
    queueName, 
    stats, 
    description 
  }: { 
    title: string
    queueName: string
    stats: QueueStats | null
    description: string 
  }) => (
    <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>{title}</span>
          <Badge variant={stats?.isEmpty ? "secondary" : "destructive"}>
            {stats?.messageCount || 0} jobs
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Queue Status</span>
            </div>
            <span className={`text-sm font-medium ${
              stats?.isEmpty ? 'text-green-400' : 'text-orange-400'
            }`}>
              {stats?.isEmpty ? 'Empty' : `${stats?.messageCount} pending`}
            </span>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => triggerProcessing(queueName, 5)}
              disabled={isProcessing || stats?.isEmpty}
              size="sm"
              variant="orange"
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Process 5 Jobs
            </Button>
            
            <Button
              onClick={() => triggerProcessing(queueName, 20)}
              disabled={isProcessing || stats?.isEmpty}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Activity className="w-4 h-4 mr-2" />
              Process All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Queue Monitor</h2>
          <p className="text-gray-400">Monitor and control evaluation processing queues</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant="outline"
            size="sm"
          >
            {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Auto Refresh
          </Button>
          
          <Button
            onClick={fetchQueueStats}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <QueueCard
          title="Personal Evaluations"
          queueName="personal_evaluation"
          stats={personalQueue}
          description="Individual presentation evaluations"
        />
        
        <QueueCard
          title="Hackathon Evaluations"
          queueName="hackathon_evaluation"
          stats={hackathonQueue}
          description="Bulk hackathon submission processing"
        />
      </div>

      {lastResult && (
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Last Processing Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Jobs Processed:</span>
                <span className="ml-2 font-medium text-white">{lastResult.processedJobs}</span>
              </div>
              <div>
                <span className="text-gray-400">Processing Time:</span>
                <span className="ml-2 font-medium text-white">{(lastResult.processingTime / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-gray-400">Remaining Jobs:</span>
                <span className="ml-2 font-medium text-white">{lastResult.remainingJobs}</span>
              </div>
            </div>
            <p className="mt-3 text-gray-300">{lastResult.message}</p>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-300 font-medium">Processing queue...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}