import { queueWorker } from './workers/queueWorker'

let isInitialized = false

export async function initializeServices(): Promise<void> {
  if (isInitialized) {

    return
  }

  try {
    // Check if we're in a serverless environment
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    
    if (isServerless) {
      // Serverless environment - no queue workers needed
    } else {
      // Only start traditional queue workers if explicitly enabled
      if (process.env.START_QUEUE_WORKER === 'true') {
        console.log('Starting traditional queue workers')
        await queueWorker.start()
      }
      // Event-driven processing - no logs needed
    }

    isInitialized = true

  } catch (error) {
    console.error('Failed to initialize services:', error)
    // Don't throw error to prevent app from crashing
    // The app can still work without the queue worker (jobs will just queue up)
  }
}

// Auto-initialize in production or when explicitly enabled
if (typeof window === 'undefined') { // Server-side only
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  
  if (!isServerless && process.env.START_QUEUE_WORKER === 'true') {
    // Use setTimeout to avoid blocking the initial import
    setTimeout(() => {
      initializeServices().catch(console.error)
    }, 1000) // 1 second delay to let Next.js fully boot
  }
  // Event-driven processing - silent initialization
}