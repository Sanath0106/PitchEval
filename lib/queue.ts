import * as amqp from 'amqplib'
import { logger } from './console-colors'

let connection: any = null
let channel: any = null
let isConnecting = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 3

// Queue names
export const QUEUES = {
  PERSONAL_EVALUATION: 'personal_evaluation',
  HACKATHON_EVALUATION: 'hackathon_evaluation',
  BULK_PROCESSING: 'bulk_processing'
}

// Job interfaces
export interface PersonalEvaluationJob {
  type: 'personal'
  evaluationId: string
  userId: string
  fileName: string
  fileBuffer: string // base64 encoded
  domain: string
  description?: string
}

export interface HackathonEvaluationJob {
  type: 'hackathon'
  evaluationId: string
  hackathonId: string
  userId: string
  fileName: string
  fileBuffer: string // base64 encoded
  weights: any
  batchId: string
  // Template validation fields (optional for backward compatibility)
  templateAnalysisId?: string
  templateAnalysis?: {
    structure: {
      totalSlides: number
      sections: Array<{
        slideNumber: number
        title: string
        contentType: string
        keywords: string[]
      }>
      expectedPageRange: { min: number, max: number }
    }
    theme: {
      primaryTheme: string
      keywords: string[]
      firstSlideContent: string
    }
    fingerprint: string
    additionalContext?: string
  }
  includeTemplateValidation?: boolean
}

export type EvaluationJob = PersonalEvaluationJob | HackathonEvaluationJob

// Initialize RabbitMQ connection
export async function initializeQueue(): Promise<void> {
  if (isConnecting) {
    logger.info('Queue initialization already in progress...')
    // Wait for current connection attempt
    const startTime = Date.now()
    while (isConnecting && (Date.now() - startTime) < 10000) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (channel) return
  }

  if (connection && channel) {
    logger.success('Queue already initialized')
    return
  }

  isConnecting = true

  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL
    
    if (!rabbitmqUrl) {
      throw new Error('RABBITMQ_URL environment variable is not configured')
    }
    
    logger.retry('Connecting to RabbitMQ...')
    
    // CloudAMQP connection options
    const connectionOptions = {
      heartbeat: 60,
      connection_timeout: 10000,
    }
    
    connection = await amqp.connect(rabbitmqUrl, connectionOptions)
    if (!connection) {
      throw new Error('Failed to create RabbitMQ connection')
    }
    
    logger.success('RabbitMQ connection established')
    
    channel = await connection.createChannel()
    logger.success('RabbitMQ channel created')

    // Declare queues with durability
    if (channel) {
      await channel.assertQueue(QUEUES.PERSONAL_EVALUATION, { 
        durable: true,
        arguments: {
          'x-max-priority': 10 // Enable priority queue
        }
      })
      logger.success(`Queue declared: ${QUEUES.PERSONAL_EVALUATION}`)
      
      await channel.assertQueue(QUEUES.HACKATHON_EVALUATION, { 
        durable: true,
        arguments: {
          'x-max-priority': 10
        }
      })
      logger.success(`Queue declared: ${QUEUES.HACKATHON_EVALUATION}`)
      
      await channel.assertQueue(QUEUES.BULK_PROCESSING, { 
        durable: true,
        arguments: {
          'x-max-priority': 5
        }
      })
      logger.success(`Queue declared: ${QUEUES.BULK_PROCESSING}`)
    }

    // Handle connection errors
    if (connection) {
      connection.on('error', (err: any) => {
        logger.error('RabbitMQ connection error:', err.message)
        connection = null
        channel = null
      })

      connection.on('close', () => {
        logger.error('RabbitMQ connection closed')
        connection = null
        channel = null
        
        // Attempt to reconnect after delay
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
          connectionAttempts++
          const delay = Math.min(1000 * connectionAttempts, 5000)
          logger.retry(`Reconnecting to RabbitMQ in ${delay}ms (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`)
          setTimeout(() => {
            initializeQueue().catch(logger.error)
          }, delay)
        }
      })
    }

    connectionAttempts = 0 // Reset on successful connection
    isConnecting = false
    logger.success('RabbitMQ initialization complete')

  } catch (error) {
    isConnecting = false
    logger.error('Failed to initialize RabbitMQ:', error)
    connection = null
    channel = null
    throw error
  }
}

// Get or create channel
export async function getChannel(): Promise<any> {
  if (!channel || !connection) {
    await initializeQueue()
  }
  
  if (!channel) {
    throw new Error('Failed to create RabbitMQ channel')
  }
  
  return channel
}

// Add job to queue
export async function addToQueue(
  queueName: string, 
  job: EvaluationJob, 
  priority: number = 5
): Promise<void> {
  try {
    const ch = await getChannel()
    
    const message = Buffer.from(JSON.stringify(job))
    
    const sent = ch.sendToQueue(queueName, message, {
      persistent: true, // Survive server restarts
      priority: priority
    })

    if (!sent) {
      throw new Error('Failed to send message to queue - channel buffer full')
    }

    logger.success(`Job added to queue: ${queueName} (priority: ${priority})`)

  } catch (error) {
    logger.error('Failed to add job to queue:', error)
    throw error
  }
}

// Process jobs from queue
export async function processQueue(
  queueName: string,
  processor: (job: EvaluationJob) => Promise<void>
): Promise<void> {
  try {
    const ch = await getChannel()
    
    // Set prefetch to 1 to ensure fair distribution
    await ch.prefetch(1)
    
    logger.retry(`Starting queue consumer for: ${queueName}`)
    
    await ch.consume(queueName, async (msg: any) => {
      if (!msg) return

      try {
        const job: EvaluationJob = JSON.parse(msg.content.toString())
        
        logger.processing(`Processing job: ${job.evaluationId}`)

        await processor(job)
        
        // Acknowledge successful processing
        ch.ack(msg)
        
        logger.success(`Job completed: ${job.evaluationId}`)

      } catch (error) {
        logger.error('Job processing failed:', error)
        
        // Reject and requeue (with limit to prevent infinite loops)
        const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1
        
        if (retryCount <= 3) {
          // Requeue with retry count
          logger.retry(`Requeuing job (retry ${retryCount}/3)`)
          ch.sendToQueue(queueName, msg.content, {
            persistent: true,
            headers: { 'x-retry-count': retryCount },
            priority: msg.properties.priority || 5
          })
          ch.ack(msg)
        } else {
          // Max retries reached, send to dead letter queue or log
          logger.error(`Max retries reached for job, removing from queue`)
          ch.ack(msg) // Remove from queue
        }
      }
    })

    logger.success(`Queue consumer ready for: ${queueName}`)

  } catch (error) {
    logger.error('Failed to process queue:', error)
    throw error
  }
}

// Get queue statistics
export async function getQueueStats(queueName: string): Promise<{
  messageCount: number
  consumerCount: number
}> {
  try {
    const ch = await getChannel()
    const queueInfo = await ch.checkQueue(queueName)
    
    return {
      messageCount: queueInfo.messageCount,
      consumerCount: queueInfo.consumerCount
    }
  } catch (error) {
    logger.error('Failed to get queue stats:', error)
    return { messageCount: 0, consumerCount: 0 }
  }
}

// Close connection
export async function closeQueue(): Promise<void> {
  try {
    if (channel) {
      await channel.close()
      channel = null
      logger.success('RabbitMQ channel closed')
    }
    
    if (connection) {
      await connection.close()
      connection = null
      logger.success('RabbitMQ connection closed')
    }
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error)
  }
}

// Health check function
export async function checkQueueHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const ch = await getChannel()
    // Try to check a queue to verify connection
    await ch.checkQueue(QUEUES.PERSONAL_EVALUATION)
    return { healthy: true }
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}