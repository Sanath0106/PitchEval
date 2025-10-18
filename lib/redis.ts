import { createClient } from 'redis'

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL
    
    if (redisUrl) {
      // Use URL-based connection for cloud Redis
      redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
        },
      })
    } else {
      // Fallback to environment variables
      redisClient = createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          connectTimeout: 10000,
        },
      })
    }

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis Client Connected to Cloud')
    })

    redisClient.on('ready', () => {
      console.log('Redis Client Ready')
    })

    await redisClient.connect()
  }

  return redisClient
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}