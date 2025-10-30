// Environment configuration helper
export const config = {
  // Environment detection
  isVercel: !!process.env.VERCEL,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Queue configuration
  queue: {
    enabled: !!process.env.RABBITMQ_URL && process.env.DISABLE_QUEUE !== 'true',
    url: process.env.RABBITMQ_URL,
    useEventDriven: process.env.START_QUEUE_WORKER !== 'true', // Default to event-driven
    useTraditionalWorkers: process.env.START_QUEUE_WORKER === 'true',
    maxJobsPerBatch: parseInt(process.env.MAX_JOBS_PER_BATCH || '10'),
    timeoutMs: process.env.VERCEL ? 50000 : 300000, // 50s for Vercel, 5min for others
    jobTimeoutMs: 45000 // 45s per individual job
  },
  
  // Processing configuration
  processing: {
    useDirectProcessing: !process.env.RABBITMQ_URL || process.env.FORCE_DIRECT_PROCESSING === 'true',
    maxRetries: parseInt(process.env.MAX_PROCESSING_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000')
  },
  
  // Cache configuration
  cache: {
    enabled: !!process.env.REDIS_URL,
    url: process.env.REDIS_URL,
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '604800') // 7 days default
  },
  
  // AI configuration
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    supportedMimeTypes: ['application/pdf']
  },
  
  // Database configuration
  database: {
    mongoUri: process.env.MONGODB_URI,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000')
  }
}

// Validation helper
export function validateConfig() {
  const errors: string[] = []
  
  if (!config.database.mongoUri) {
    errors.push('MONGODB_URI is required')
  }
  
  if (!config.ai.geminiApiKey) {
    errors.push('GEMINI_API_KEY is required')
  }
  
  if (config.queue.enabled && !config.queue.url) {
    errors.push('RABBITMQ_URL is required when queue is enabled')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get processing strategy
export function getProcessingStrategy(): 'queue' | 'direct' {
  if (config.processing.useDirectProcessing) {
    return 'direct'
  }
  
  if (config.queue.enabled) {
    return 'queue'
  }
  
  return 'direct'
}

// Get environment info for debugging
export function getEnvironmentInfo() {
  return {
    platform: config.isVercel ? 'vercel' : 'other',
    nodeEnv: process.env.NODE_ENV,
    processingStrategy: getProcessingStrategy(),
    queueEnabled: config.queue.enabled,
    cacheEnabled: config.cache.enabled,
    configValid: validateConfig().isValid
  }
}