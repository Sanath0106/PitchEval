import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/mongodb'
import Evaluation from '@/lib/models/Evaluation'
import Hackathon from '@/lib/models/Hackathon'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Fetch recent evaluations for the user, sorted by creation date
    const evaluations = await Evaluation
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('fileName domain status scores createdAt type hackathonId')
      .lean()

    // Get hackathons for grouping
    const hackathonIds = [...new Set(evaluations.filter(e => e.hackathonId).map(e => e.hackathonId))]
    const hackathons = await Hackathon
      .find({ _id: { $in: hackathonIds } })
      .select('name createdAt')
      .lean()

    const hackathonMap = new Map(hackathons.map((h: any) => [h._id.toString(), h]))

    // Group evaluations by type and hackathon
    const groupedItems: any[] = []
    const processedHackathons = new Set()

    for (const evaluation of evaluations) {
      if (evaluation.type === 'hackathon' && evaluation.hackathonId) {
        const hackathonId = evaluation.hackathonId.toString()
        
        if (!processedHackathons.has(hackathonId)) {
          processedHackathons.add(hackathonId)
          const hackathon = hackathonMap.get(hackathonId)
          
          if (hackathon) {
            // Get all evaluations for this hackathon
            const hackathonEvaluations = evaluations.filter(e => 
              e.hackathonId && e.hackathonId.toString() === hackathonId
            )
            
            const completedCount = hackathonEvaluations.filter(e => e.status === 'completed').length
            const totalCount = hackathonEvaluations.length
            
            groupedItems.push({
              _id: hackathonId,
              type: 'hackathon',
              name: hackathon.name,
              domain: 'hackathon',
              status: completedCount === totalCount ? 'completed' : 
                     hackathonEvaluations.some(e => e.status === 'processing') ? 'processing' : 'failed',
              evaluationCount: totalCount,
              completedCount: completedCount,
              createdAt: hackathon.createdAt.toISOString()
            })
          }
        }
      } else if (evaluation.type === 'personal' || !evaluation.type) {
        // Individual evaluation
        groupedItems.push({
          _id: (evaluation as any)._id.toString(),
          type: 'personal',
          fileName: evaluation.fileName,
          domain: evaluation.domain,
          status: evaluation.status,
          scores: evaluation.scores ? {
            overall: evaluation.scores.overall
          } : undefined,
          createdAt: evaluation.createdAt.toISOString()
        })
      }
    }

    // Sort by creation date and limit to 10 items
    const sortedItems = groupedItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      evaluations: sortedItems
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recent evaluations' },
      { status: 500 }
    )
  }
}