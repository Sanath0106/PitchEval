'use client'

interface SimpleLoaderProps {
  message?: string
}

export default function SimpleLoader({ message = "Loading..." }: SimpleLoaderProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-spin mx-auto mb-6 relative shadow-lg shadow-orange-500/25">
          <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-pulse"></div>
        </div>
        <p className="text-gray-300 text-lg font-medium">{message}</p>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}