import { NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'

export async function GET() {
  try {
    await dbConnect()
    
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: 'Database connection failed'
    }, { status: 500 })
  }
}