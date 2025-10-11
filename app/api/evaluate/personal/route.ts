import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect, Evaluation, evaluatePresentationFile } from '../../../../lib'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const domain = formData.get('domain') as string
    const description = formData.get('description') as string

    if (!file || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create evaluation record
    const evaluation = new Evaluation({
      userId,
      type: 'personal',
      fileName: file.name,
      domain,
      description,
      status: 'processing',
    })

    await evaluation.save()

    // Process file directly with Gemini in background
    processFileWithGemini(evaluation._id.toString(), file, domain, description)

    return NextResponse.json({ 
      evaluationId: evaluation._id.toString(),
      message: 'File uploaded successfully. Processing...' 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processFileWithGemini(evaluationId: string, file: File, domain: string, description?: string) {
  try {
    await dbConnect()
    
    // Let Gemini 2.0 Flash handle BOTH file reading AND analysis
    const aiResult = await evaluatePresentationFile(file, domain, description)
    
    // Update evaluation with results
    const updatedEvaluation = await Evaluation.findByIdAndUpdate(evaluationId, {
      scores: aiResult.scores,
      suggestions: aiResult.suggestions,
      status: 'completed',
      updatedAt: new Date(),
    }, { new: true })

  } catch (error) {
    // Update evaluation with error status
    await Evaluation.findByIdAndUpdate(evaluationId, {
      status: 'failed',
      updatedAt: new Date(),
    })
  }
}