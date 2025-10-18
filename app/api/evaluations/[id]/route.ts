import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../lib/mongodb'
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
      hackathonId: evaluation.hackathonId,
      status: evaluation.status,
      scores: evaluation.scores,
      suggestions: evaluation.suggestions,
      templateValidation: evaluation.templateValidation,
      createdAt: evaluation.createdAt.toISOString()
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}