import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../_lib/mongodb'
import Hackathon from '../../../../_lib/models/Hackathon'
import Evaluation from '../../../../_lib/models/Evaluation'

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

    // Get completed evaluations
    const evaluations = await Evaluation.find({
      hackathonId: id,
      status: 'completed'
    }).sort({ 'scores.overall': -1 })

    // Separate relevant and discarded evaluations
    const relevantEvaluations = evaluations.filter(e => 
      !e.trackRelevance || e.trackRelevance.isRelevant !== false
    )
    const discardedEvaluations = evaluations.filter(e => 
      e.trackRelevance && e.trackRelevance.isRelevant === false
    )

    // Create CSV content
    const csvHeaders = [
      'Status',
      'Rank',
      'File Name',
      'Overall Score',
      'Feasibility',
      'Innovation', 
      'Impact',
      'Clarity',
      'Matched Tracks',
      'Track Relevance Score',
      'Discard Reason',
      'Evaluated Date'
    ]

    // Ranked evaluations
    const rankedRows = relevantEvaluations.map((evaluation, index) => [
      'RANKED',
      index + 1,
      evaluation.fileName,
      evaluation.scores?.overall?.toFixed(2) || 'N/A',
      evaluation.scores?.feasibility?.toFixed(2) || 'N/A',
      evaluation.scores?.innovation?.toFixed(2) || 'N/A',
      evaluation.scores?.impact?.toFixed(2) || 'N/A',
      evaluation.scores?.clarity?.toFixed(2) || 'N/A',
      evaluation.trackRelevance?.matchedTracks?.join('; ') || 'All Tracks',
      evaluation.trackRelevance?.relevanceScore?.toFixed(1) || 'N/A',
      '',
      new Date(evaluation.createdAt).toLocaleDateString()
    ])

    // Discarded evaluations
    const discardedRows = discardedEvaluations.map((evaluation) => [
      'DISCARDED',
      'N/A',
      evaluation.fileName,
      evaluation.scores?.overall?.toFixed(2) || 'N/A',
      evaluation.scores?.feasibility?.toFixed(2) || 'N/A',
      evaluation.scores?.innovation?.toFixed(2) || 'N/A',
      evaluation.scores?.impact?.toFixed(2) || 'N/A',
      evaluation.scores?.clarity?.toFixed(2) || 'N/A',
      'None',
      evaluation.trackRelevance?.relevanceScore?.toFixed(1) || 'N/A',
      evaluation.trackRelevance?.reason || 'Track mismatch',
      new Date(evaluation.createdAt).toLocaleDateString()
    ])

    const csvRows = [...rankedRows, ...discardedRows]

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${hackathon.name}_results.csv"`
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}