import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  // Minimal middleware - let pages handle their own auth
  const url = req.nextUrl.pathname
  
  // Only protect API routes that absolutely need it
  if (url.startsWith('/api/evaluate') || 
      url.startsWith('/api/evaluations') || 
      url.startsWith('/api/hackathon') || 
      url.startsWith('/api/reports')) {
    try {
      await auth.protect()
    } catch {
      // Silently fail - let the API handle auth errors
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}