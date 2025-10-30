// Production-safe logging utility
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '')
    }
  },
  
  info: (message: string, data?: any) => {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, data || '')
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '')
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || '')
  },
  
  // Safe logging that filters sensitive data
  safelog: (message: string, data?: any) => {
    if (isDevelopment && data) {
      // Filter out sensitive fields
      const filtered = filterSensitiveData(data)
      console.log(`[SAFE] ${message}`, filtered)
    } else if (isDevelopment) {
      console.log(`[SAFE] ${message}`)
    }
  }
}

// Filter sensitive data from logs
function filterSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) return data
  
  const sensitive = ['_id', 'id', 'userId', 'email', 'password', 'token', 'key', 'secret']
  const filtered = { ...data }
  
  for (const key of sensitive) {
    if (key in filtered) {
      filtered[key] = '[FILTERED]'
    }
  }
  
  return filtered
}

export default logger