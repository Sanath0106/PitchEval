import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../lib/mongodb'
import Evaluation from '../../../../lib/models/Evaluation'
import { processPersonalEvaluation, processHackathonEvaluation } from '../../../../lib/processors/evaluationProcessor'

export async function POST(
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
    
    // Find the evaluation
    const evaluation = await Evaluation.findOne({
      _id: id,
      userId
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    if (evaluation.status === 'completed') {
      return NextResponse.json({ 
        message: 'Evaluation already completed',
        status: evaluation.status 
      })
    }

    // Create job object for processing
    const job = {
      type: evaluation.type,
      evaluationId: evaluation._id.toString(),
      userId: evaluation.userId,
      fileName: evaluation.fileName,
      fileBuffer: '', // Will be handled by processor
      domain: evaluation.domain,
      description: evaluation.description,
      hackathonId: evaluation.hackathonId,
      weights: evaluation.weights || { innovation: 25, feasibility: 25, impact: 25, clarity: 25 },
      batchId: evaluation.batchId || 'manual-trigger'
    }

    // Process based on type
    if (evaluation.type === 'personal') {
      await processPersonalEvaluation(job as any)
    } else if (evaluation.type === 'hackathon') {
      await processHackathonEvaluation(job as any)
    }

    return NextResponse.json({ 
      message: 'Processing triggered successfully',
      evaluationId: id
    })

  } catch (error) {
    console.error('Manual processing failed:', error)
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}