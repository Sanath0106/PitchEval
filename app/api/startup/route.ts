import { NextResponse } from 'next/server'
import { initializeServices } from '../../../lib/startup'

// This endpoint can be called by Vercel's deployment hooks or monitoring services
export async function GET() {
  try {
    await initializeServices()
    
    return NextResponse.json({
      success: true,
      message: 'Services started successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  // Same as GET for flexibility
  return GET()
}