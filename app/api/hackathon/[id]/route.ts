import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../lib/mongodb'
import Hackathon from '../../../../lib/models/Hackathon'
import Evaluation from '../../../../lib/models/Evaluation'

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
    
    // Find hackathon
    const hackathon = await Hackathon.findOne({ 
      _id: id, 
      userId 
    })

    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 })
    }

    // Get all evaluations for this hackathon
    const evaluations = await Evaluation.find({
      hackathonId: id
    }).sort({ 'scores.overall': -1 })

    return NextResponse.json({
      _id: hackathon._id.toString(),
      name: hackathon.name,
      status: hackathon.status,
      weights: hackathon.weights,
      evaluations: evaluations.map(evaluation => ({
        _id: evaluation._id.toString(),
        fileName: evaluation.fileName,
        domain: evaluation.domain,
        status: evaluation.status,
        scores: evaluation.scores,
        suggestions: evaluation.suggestions,
        trackRelevance: evaluation.trackRelevance,
        templateValidation: evaluation.templateValidation,
        rank: evaluation.rank,
        createdAt: evaluation.createdAt.toISOString()
      })),
      createdAt: hackathon.createdAt.toISOString()
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}