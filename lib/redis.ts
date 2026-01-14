import { createClient } from 'redis'

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null
let isConnecting = false
let connectionFailed = false // Track if connection has permanently failed

export async function getRedisClient() {
  // If connection has permanently failed, don't retry
  if (connectionFailed) {
    throw new Error('Redis connection permanently failed - please check REDIS_URL')
  }

  // If client exists and is ready, return it
  if (redisClient && redisClient.isReady) {
    return redisClient
  }

  // If client exists but not ready, wait for it
  if (redisClient && !redisClient.isReady && isConnecting) {
    // Wait for connection to complete (max 5 seconds)
    const startTime = Date.now()
    while (!redisClient.isReady && (Date.now() - startTime) < 5000) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (redisClient.isReady) {
      return redisClient
    }
  }

  // Create new client if none exists or previous one failed
  if (!redisClient || !redisClient.isReady) {
    isConnecting = true
    
    const redisUrl = process.env.REDIS_URL
    
    if (!redisUrl) {
      connectionFailed = true
      throw new Error('REDIS_URL environment variable is not configured')
    }

    try {
      // Use URL-based connection for cloud Redis
      redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000, // Reduced from 10s to 5s
          reconnectStrategy: (retries) => {
            // Only retry 3 times instead of 10
            if (retries > 3) {
              console.error('❌ Redis: Max reconnection attempts reached (3)')
              connectionFailed = true // Mark as permanently failed
              return new Error('Max reconnection attempts reached')
            }
            const delay = Math.min(100 * Math.pow(2, retries), 3000)
            console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries + 1}/3)`)
            return delay
          }
        },
      })

      redisClient.on('error', (err) => {
        // Only log DNS errors once
        if (err.message.includes('ENOTFOUND')) {
          if (!connectionFailed) {
            console.error('❌ Redis: Cannot resolve hostname - please check REDIS_URL')
            connectionFailed = true
          }
        } else {
          console.error('❌ Redis Client Error:', err.message)
        }
      })

      redisClient.on('connect', () => {
        console.log('✅ Redis Client Connected')
        connectionFailed = false // Reset on successful connection
      })

      redisClient.on('ready', () => {
        console.log('✅ Redis Client Ready')
        isConnecting = false
        connectionFailed = false
      })

      redisClient.on('reconnecting', () => {
        console.log('🔄 Redis Client Reconnecting...')
      })

      redisClient.on('end', () => {
        console.log('❌ Redis Client Connection Ended')
        isConnecting = false
      })

      await redisClient.connect()
      
    } catch (error) {
      isConnecting = false
      connectionFailed = true // Mark as permanently failed
      console.error('❌ Failed to connect to Redis:', error instanceof Error ? error.message : 'Unknown error')
      console.log('⚠️ System will continue without caching - uploads will be slower')
      redisClient = null
      throw error
    }
  }

  return redisClient
}

export async function closeRedisConnection() {
  if (redisClient) {
    try {
      await redisClient.quit()
      console.log('✅ Redis connection closed gracefully')
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error)
    } finally {
      redisClient = null
      isConnecting = false
      connectionFailed = false
    }
  }
}

// Health check function
export async function checkRedisHealth(): Promise<{ healthy: boolean; error?: string }> {
  if (connectionFailed) {
    return { healthy: false, error: 'Redis connection permanently failed' }
  }
  
  try {
    const client = await getRedisClient()
    await client.ping()
    return { healthy: true }
  } catch (error) {
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}