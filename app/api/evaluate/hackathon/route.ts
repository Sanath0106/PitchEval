import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../_lib/mongodb'
import Hackathon from '../../../_lib/models/Hackathon'
import Evaluation from '../../../_lib/models/Evaluation'
import { evaluatePresentationFile } from '../../../_lib/ai/gemini'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const formData = await request.formData()
    const hackathonName = formData.get('hackathonName') as string
    const tracks = formData.get('tracks') as string
    const additionalInfo = formData.get('additionalInfo') as string
    const weights = JSON.parse(formData.get('weights') as string)
    
    const files = formData.getAll('files') as File[]

    if (!hackathonName || files.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create hackathon record
    const hackathon = new Hackathon({
      userId,
      name: hackathonName,
      tracks: tracks.split(',').map(t => t.trim()).filter(Boolean),
      weights,
      additionalInfo,
      status: 'processing',
    })

    await hackathon.save()

    // Create evaluation records for each file
    const evaluationPromises = files.map(async (file) => {
      const evaluation = new Evaluation({
        userId,
        type: 'hackathon',
        fileName: file.name,
        domain: 'hackathon',
        hackathonId: hackathon._id.toString(),
        status: 'processing',
      })
      
      await evaluation.save()
      
      // Process file in background
      processHackathonFileAsync(evaluation._id.toString(), file, weights)
      
      return evaluation._id.toString()
    })

    const evaluationIds = await Promise.all(evaluationPromises)
    
    // Update hackathon with evaluation IDs
    hackathon.evaluations = evaluationIds
    await hackathon.save()

    return NextResponse.json({ 
      hackathonId: hackathon._id.toString(),
      message: 'Files uploaded successfully. Processing...' 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processHackathonFileAsync(evaluationId: string, file: File, weights: any) {
  try {
    await dbConnect()
    
    // Get evaluation to find hackathon details
    const evaluation = await Evaluation.findById(evaluationId)
    if (!evaluation) {
      throw new Error('Evaluation not found')
    }
    
    // Get hackathon details including tracks
    const hackathon = await Hackathon.findById(evaluation.hackathonId)
    if (!hackathon) {
      throw new Error('Hackathon not found')
    }
    
    // Process file with track information
    const aiResult = await evaluatePresentationFile(file, 'hackathon', undefined, hackathon.tracks)
    
    // Calculate weighted overall score
    const weightedScore = (
      (aiResult.scores.innovation * weights.innovation / 100) +
      (aiResult.scores.feasibility * weights.feasibility / 100) +
      (aiResult.scores.impact * weights.impact / 100) +
      (aiResult.scores.clarity * weights.clarity / 100)
    )
    
    // Update evaluation with results
    const updateData: any = {
      scores: {
        ...aiResult.scores,
        overall: weightedScore,
      },
      suggestions: aiResult.suggestions,
      status: 'completed',
      updatedAt: new Date(),
    }

    // Add track relevance if available
    if (aiResult.trackRelevance) {
      updateData.trackRelevance = aiResult.trackRelevance
    }

    await Evaluation.findByIdAndUpdate(evaluationId, updateData)

    // Check if all evaluations for this hackathon are complete
    const updatedEvaluation = await Evaluation.findById(evaluationId)
    if (updatedEvaluation) {
      await updateHackathonRankings(updatedEvaluation.hackathonId)
    }

  } catch (error) {
    // Update evaluation with error status
    await Evaluation.findByIdAndUpdate(evaluationId, {
      status: 'failed',
      updatedAt: new Date(),
    })
  }
}

async function updateHackathonRankings(hackathonId: string) {
  try {
    // Get all completed evaluations for this hackathon
    const evaluations = await Evaluation.find({
      hackathonId,
      status: 'completed'
    }).sort({ 'scores.overall': -1 })

    // Update rankings
    const updatePromises = evaluations.map((evaluation, index) => {
      return Evaluation.findByIdAndUpdate(evaluation._id, {
        rank: index + 1,
        updatedAt: new Date(),
      })
    })

    await Promise.all(updatePromises)

    // Check if all evaluations are complete and update hackathon status
    const totalEvaluations = await Evaluation.countDocuments({ hackathonId })
    const completedEvaluations = await Evaluation.countDocuments({ 
      hackathonId, 
      status: 'completed' 
    })

    if (totalEvaluations === completedEvaluations) {
      await Hackathon.findByIdAndUpdate(hackathonId, {
        status: 'completed',
        updatedAt: new Date(),
      })
    }

  } catch (error) {
    // Silently handle ranking update errors
  }
}