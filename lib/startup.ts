import { queueWorker } from './workers/queueWorker'

let isInitialized = false

export async function initializeServices(): Promise<void> {
  if (isInitialized) {

    return
  }

  try {
    // Start queue worker if enabled
    if (process.env.START_QUEUE_WORKER === 'true' || process.env.NODE_ENV === 'production') {
      await queueWorker.start()
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
  if (process.env.NODE_ENV === 'production' || process.env.START_QUEUE_WORKER === 'true') {
    // Use setTimeout to avoid blocking the initial import
    setTimeout(() => {
      initializeServices().catch(console.error)
    }, 1000) // 1 second delay to let Next.js fully boot
  }
}