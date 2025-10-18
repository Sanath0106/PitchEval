import { createHash } from 'crypto'
import { getRedisClient } from './redis'

export interface CachedEvaluation {
  scores: {
    feasibility: number
    innovation: number
    impact: number
    clarity: number
    overall: number
  }
  suggestions: string[]
  domain: string
  fileName: string
  createdAt: string
  cacheTimestamp: string
}

// Generate cache key from file content
export function generateFileHash(fileBuffer: Buffer, fileName: string): string {
  const hash = createHash('sha256')
  hash.update(fileBuffer)
  hash.update(fileName)
  return hash.digest('hex')
}

// Cache key format: pitch:hash:domain
export function getCacheKey(fileHash: string, domain: string): string {
  return `pitch:${fileHash}:${domain.toLowerCase()}`
}

// Get cached evaluation
export async function getCachedEvaluation(
  fileHash: string, 
  domain: string
): Promise<CachedEvaluation | null> {
  try {
    const redis = await getRedisClient()
    const cacheKey = getCacheKey(fileHash, domain)
    
    const cached = await redis.get(cacheKey)
    if (!cached) return null

    const evaluation = JSON.parse(cached) as CachedEvaluation
    
    // Check if cache is still valid (24 hours)
    const cacheAge = Date.now() - new Date(evaluation.cacheTimestamp).getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    if (cacheAge > maxAge) {
      await redis.del(cacheKey)
      return null
    }

    return evaluation
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

// Cache evaluation result
export async function setCachedEvaluation(
  fileHash: string,
  domain: string,
  evaluation: Omit<CachedEvaluation, 'cacheTimestamp'>
): Promise<void> {
  try {
    const redis = await getRedisClient()
    const cacheKey = getCacheKey(fileHash, domain)
    
    const cacheData: CachedEvaluation = {
      ...evaluation,
      cacheTimestamp: new Date().toISOString()
    }

    // Cache for 7 days
    await redis.setEx(cacheKey, 7 * 24 * 60 * 60, JSON.stringify(cacheData))
    
    console.log(`Cached evaluation: ${cacheKey}`)
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  totalKeys: number
  memoryUsage: string
  hitRate?: number
}> {
  try {
    const redis = await getRedisClient()
    
    const keys = await redis.keys('pitch:*')
    const info = await redis.info('memory')
    
    const memoryMatch = info.match(/used_memory_human:(.+)/)
    const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown'

    return {
      totalKeys: keys.length,
      memoryUsage,
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return {
      totalKeys: 0,
      memoryUsage: 'Unknown'
    }
  }
}

// Clear old cache entries
export async function clearExpiredCache(): Promise<number> {
  try {
    const redis = await getRedisClient()
    const keys = await redis.keys('pitch:*')
    let deletedCount = 0

    for (const key of keys) {
      const cached = await redis.get(key)
      if (cached) {
        const evaluation = JSON.parse(cached) as CachedEvaluation
        const cacheAge = Date.now() - new Date(evaluation.cacheTimestamp).getTime()
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days

        if (cacheAge > maxAge) {
          await redis.del(key)
          deletedCount++
        }
      }
    }

    return deletedCount
  } catch (error) {
    console.error('Cache cleanup error:', error)
    return 0
  }
}