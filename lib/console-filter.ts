// Console filter to suppress Next.js 15 headers warnings
if (typeof window !== 'undefined') {
  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: any[]) => {
    const message = args.join(' ')
    
    // Filter out headers() warnings
    if (
      message.includes('headers()') ||
      message.includes('sync-dynamic-apis') ||
      message.includes('Hydration failed') ||
      message.includes('server rendered text')
    ) {
      return // Suppress these warnings
    }
    
    originalError.apply(console, args)
  }

  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    
    // Filter out headers() warnings
    if (
      message.includes('headers()') ||
      message.includes('sync-dynamic-apis')
    ) {
      return // Suppress these warnings
    }
    
    originalWarn.apply(console, args)
  }
}

export {}