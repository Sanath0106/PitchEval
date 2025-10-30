import { NextRequest, NextResponse } from 'next/server'
import { getQueueStats, QUEUES } from '../../../../lib/queue'

export async function GET(request: NextRequest) {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL ? 'vercel' : 'local',
      queueSystem: {
        enabled: !!process.env.RABBITMQ_URL,
        url: process.env.RABBITMQ_URL ? 'configured' : 'not configured'
      },
      queues: {} as Record<string, any>
    }

    // Check each queue if RabbitMQ is available
    if (process.env.RABBITMQ_URL) {
      try {
        for (const [name, queueName] of Object.entries(QUEUES)) {
          try {
            const stats = await getQueueStats(queueName)
            healthCheck.queues[name] = {
              name: queueName,
              status: 'healthy',
              messageCount: stats.messageCount,
              consumerCount: stats.consumerCount,
              isEmpty: stats.messageCount === 0
            }
          } catch (error) {
            healthCheck.queues[name] = {
              name: queueName,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        }
      } catch (error) {
        healthCheck.queueSystem = {
          enabled: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }
    }

    // Determine overall health
    const hasErrors = Object.values(healthCheck.queues).some((q: any) => q.status === 'error')
    const overallStatus = !process.env.RABBITMQ_URL 
      ? 'queue-disabled' 
      : hasErrors 
      ? 'degraded' 
      : 'healthy'

    return NextResponse.json({
      status: overallStatus,
      ...healthCheck
    }, { 
      status: overallStatus === 'healthy' || overallStatus === 'queue-disabled' ? 200 : 503 
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed'
    }, { status: 500 })
  }
}