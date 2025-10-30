import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { processQueue, QUEUES, getQueueStats } from '../../../../lib/queue'
import { processEvaluationJob } from '../../../../lib/processors/evaluationProcessor'

export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth()
    const { queueName, maxJobs = 5, userId: bodyUserId } = await request.json()
    
    // Allow internal calls with userId in body, or external calls with auth
    const userId = bodyUserId || authUserId
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if queue system is available
    if (!process.env.RABBITMQ_URL) {
      return NextResponse.json({ 
        error: 'Queue system not configured',
        message: 'RabbitMQ URL not provided in environment variables'
      }, { status: 503 })
    }
    
    if (!queueName || !Object.values(QUEUES).includes(queueName)) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 400 })
    }

    // Validate maxJobs to prevent abuse
    if (maxJobs > 50) {
      return NextResponse.json({ 
        error: 'Too many jobs requested',
        message: 'Maximum 50 jobs per batch to prevent timeouts'
      }, { status: 400 })
    }

    // Processing queue jobs
    
    let processedCount = 0
    let failedCount = 0
    const startTime = Date.now()
    const maxProcessingTime = process.env.VERCEL ? 50000 : 300000 // 50s for Vercel, 5min for others
    const errors: string[] = []
    
    // Process jobs one by one until we hit limits
    while (processedCount < maxJobs && (Date.now() - startTime) < maxProcessingTime) {
      try {
        // Check if there are jobs in the queue
        const stats = await getQueueStats(queueName)
        if (stats.messageCount === 0) {
          // Queue is empty
          break
        }
        
        // Process one job with timeout protection
        let jobProcessed = false
        const jobStartTime = Date.now()
        
        await Promise.race([
          processQueue(queueName, async (job) => {
            // Processing evaluation job
            await processEvaluationJob(job)
            processedCount++
            jobProcessed = true
            console.log(`Completed job: ${job.evaluationId} in ${Date.now() - jobStartTime}ms`)
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Job timeout')), 45000) // 45s timeout per job
          )
        ])
        
        if (!jobProcessed) {
          // No jobs available
          break
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`❌ Error processing job:`, errorMsg)
        errors.push(errorMsg)
        failedCount++
        
        // Stop if too many failures
        if (failedCount >= 3) {
          console.log(`Too many failures (${failedCount}), stopping batch`)
          break
        }
      }
    }
    
    // Check if there are more jobs to process
    const finalStats = await getQueueStats(queueName)
    const hasMoreJobs = finalStats.messageCount > 0
    const processingTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      processedJobs: processedCount,
      failedJobs: failedCount,
      processingTime,
      averageJobTime: processedCount > 0 ? Math.round(processingTime / processedCount) : 0,
      remainingJobs: finalStats.messageCount,
      hasMoreJobs,
      errors: errors.length > 0 ? errors : undefined,
      message: hasMoreJobs 
        ? `Processed ${processedCount} jobs (${failedCount} failed). ${finalStats.messageCount} jobs remaining.`
        : `Processed ${processedCount} jobs (${failedCount} failed). Queue is now empty.`,
      recommendation: hasMoreJobs && failedCount < 3 
        ? 'Continue processing remaining jobs'
        : failedCount >= 3 
        ? 'Check logs for recurring errors before continuing'
        : 'All jobs completed successfully'
    })

  } catch (error) {
    console.error('Queue processing failed:', error)
    return NextResponse.json({ 
      error: 'Queue processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// GET endpoint to check queue status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queueName = searchParams.get('queue')
    
    if (!queueName || !Object.values(QUEUES).includes(queueName)) {
      return NextResponse.json({ error: 'Invalid queue name' }, { status: 400 })
    }
    
    const stats = await getQueueStats(queueName)
    
    return NextResponse.json({
      queueName,
      messageCount: stats.messageCount,
      consumerCount: stats.consumerCount,
      isEmpty: stats.messageCount === 0
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to get queue stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}