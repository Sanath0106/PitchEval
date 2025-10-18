import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../lib/mongodb'
import Evaluation from '../../../../lib/models/Evaluation'
import { addToQueue, QUEUES, PersonalEvaluationJob } from '../../../../lib/queue'

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


    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Create evaluation record
    const evaluation = new Evaluation({
      userId,
      type: 'personal',
      fileName: file.name,
      domain,
      description,
      status: 'queued', // Changed from 'processing' to 'queued'
    })

    await evaluation.save()

    // Convert file to buffer for queue
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    // Add job to queue instead of direct processing
    const job: PersonalEvaluationJob = {
      type: 'personal',
      evaluationId: evaluation._id.toString(),
      userId,
      fileName: file.name,
      fileBuffer: fileBuffer.toString('base64'),
      domain,
      description
    }

    try {
      await addToQueue(QUEUES.PERSONAL_EVALUATION, job, 8) // High priority for personal uploads

      return NextResponse.json({ 
        evaluationId: evaluation._id.toString(),
        message: 'File uploaded successfully. Added to processing queue...',
        status: 'queued'
      })
    } catch (queueError) {
      console.log('Queue not available, processing directly:', queueError)
      
      // Fallback: Process directly without queue
      const { processPersonalEvaluation } = await import('../../../../lib/processors/evaluationProcessor')
      
      // Process in background (don't await)
      processPersonalEvaluation(job).catch(error => {
        console.error('Direct processing failed:', error)
      })

      return NextResponse.json({ 
        evaluationId: evaluation._id.toString(),
        message: 'File uploaded successfully. Processing started...',
        status: 'processing'
      })
    }

  } catch (error) {
    console.error('Personal evaluation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// Note: File processing is now handled by the queue worker
// See lib/processors/evaluationProcessor.ts for the actual processing logic