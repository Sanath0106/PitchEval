import { processQueue, QUEUES, initializeQueue } from '../queue'
import { processEvaluationJob } from '../processors/evaluationProcessor'

class QueueWorker {
  private isRunning = false

  async start(): Promise<void> {
    if (this.isRunning) {

      return
    }

    try {

      
      // Initialize RabbitMQ connection
      await initializeQueue()
      
      this.isRunning = true

      // Start processing different queues
      await Promise.all([
        this.processPersonalQueue(),
        this.processHackathonQueue(),
        this.processBulkQueue()
      ])

    } catch (error) {
      console.error('Failed to start queue worker:', error)
      this.isRunning = false
      throw error
    }
  }

  private async processPersonalQueue(): Promise<void> {
    await processQueue(QUEUES.PERSONAL_EVALUATION, async (job) => {
      await processEvaluationJob(job)
    })
  }

  private async processHackathonQueue(): Promise<void> {
    await processQueue(QUEUES.HACKATHON_EVALUATION, async (job) => {
      await processEvaluationJob(job)
    })
  }

  private async processBulkQueue(): Promise<void> {
    await processQueue(QUEUES.BULK_PROCESSING, async (job) => {
      await processEvaluationJob(job)
    })
  }

  stop(): void {
    this.isRunning = false

  }

  isWorkerRunning(): boolean {
    return this.isRunning
  }
}

// Singleton instance
export const queueWorker = new QueueWorker()

// Note: Auto-start is now handled by lib/startup.ts for better reliability

export default queueWorker