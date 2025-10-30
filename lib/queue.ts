import * as amqp from 'amqplib'

let connection: any = null
let channel: any = null

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
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672'
    
    // CloudAMQP connection options
    const connectionOptions = {
      heartbeat: 60,
      connection_timeout: 10000,
    }
    
    connection = await amqp.connect(rabbitmqUrl, connectionOptions)
    if (!connection) {
      throw new Error('Failed to create RabbitMQ connection')
    }
    channel = await connection.createChannel()

    // Declare queues with durability
    if (channel) {
      await channel.assertQueue(QUEUES.PERSONAL_EVALUATION, { 
        durable: true,
        arguments: {
          'x-max-priority': 10 // Enable priority queue
        }
      })
      
      await channel.assertQueue(QUEUES.HACKATHON_EVALUATION, { 
        durable: true,
        arguments: {
          'x-max-priority': 10
        }
      })
      
      await channel.assertQueue(QUEUES.BULK_PROCESSING, { 
        durable: true,
        arguments: {
          'x-max-priority': 5
        }
      })
    }



    // Handle connection errors
    if (connection) {
      connection.on('error', (err: any) => {
        console.error('RabbitMQ connection error:', err)
      })

      connection.on('close', () => {

        connection = null
        channel = null
      })
    }

  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error)
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
    
    ch.sendToQueue(queueName, message, {
      persistent: true, // Survive server restarts
      priority: priority
    })



  } catch (error) {
    console.error('Failed to add job to queue:', error)
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
    
    await ch.consume(queueName, async (msg: any) => {
      if (!msg) return

      try {
        const job: EvaluationJob = JSON.parse(msg.content.toString())
        
        // Processing evaluation job

        await processor(job)
        
        // Acknowledge successful processing
        ch.ack(msg)
        
        // Job completed - logging removed for security

      } catch (error) {
        console.error('Job processing failed:', error)
        
        // Reject and requeue (with limit to prevent infinite loops)
        const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) + 1
        
        if (retryCount <= 3) {
          // Requeue with retry count
          ch.sendToQueue(queueName, msg.content, {
            persistent: true,
            headers: { 'x-retry-count': retryCount }
          })
          ch.ack(msg)
        } else {
          // Max retries reached, send to dead letter queue or log
          console.error(`Max retries reached for job: ${msg.content.toString()}`)
          ch.ack(msg) // Remove from queue
        }
      }
    })

    // Queue processor ready

  } catch (error) {
    console.error('Failed to process queue:', error)
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
    console.error('Failed to get queue stats:', error)
    return { messageCount: 0, consumerCount: 0 }
  }
}

// Close connection
export async function closeQueue(): Promise<void> {
  try {
    if (channel) {
      await channel.close()
      channel = null
    }
    
    if (connection) {
      await connection.close()
      connection = null
    }
    
    // RabbitMQ connection closed
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error)
  }
}