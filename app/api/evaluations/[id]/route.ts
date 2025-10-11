import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../_lib/mongodb'
import Evaluation from '../../../_lib/models/Evaluation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    
    const evaluation = await Evaluation.findOne({ 
      _id: id, 
      userId 
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    return NextResponse.json({
      _id: evaluation._id.toString(),
      fileName: evaluation.fileName,
      domain: evaluation.domain,
      status: evaluation.status,
      scores: evaluation.scores,
      suggestions: evaluation.suggestions,
      createdAt: evaluation.createdAt.toISOString()
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}