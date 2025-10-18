import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '../../../../lib/mongodb'
import Hackathon from '../../../../lib/models/Hackathon'
import Evaluation from '../../../../lib/models/Evaluation'
import TemplateAnalysis from '../../../../lib/models/TemplateAnalysis'
import { addToQueue, QUEUES, HackathonEvaluationJob } from '../../../../lib/queue'
import { analyzeTemplateStructure } from '../../../../lib/ai/templateAnalysis'
import { v4 as uuidv4 } from 'uuid'

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

    
    // Handle template upload
    const templateFile = formData.get('templateFile') as File | null
    const templateAnalysisData = formData.get('templateAnalysis') as string | null
    
    const files = formData.getAll('files') as File[]

    if (!hackathonName || files.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Process template if provided
    let templateAnalysisId: string | null = null
    let parsedTemplateAnalysis = null
    
    if (templateFile && templateAnalysisData) {
      try {
        parsedTemplateAnalysis = JSON.parse(templateAnalysisData)
        
        // Create template analysis record
        const templateAnalysis = new TemplateAnalysis({
          hackathonId: '', // Will be set after hackathon is created
          userId,
          templateFileName: templateFile.name,
          structure: parsedTemplateAnalysis.structure,
          theme: parsedTemplateAnalysis.theme,
          additionalContext: parsedTemplateAnalysis.additionalContext,
          fingerprint: parsedTemplateAnalysis.fingerprint,
        })
        
        await templateAnalysis.save()
        templateAnalysisId = templateAnalysis._id.toString()
      } catch (error) {
        console.error('Failed to save template analysis:', error)
        console.log(`⚠️ Continuing hackathon creation without template analysis for: ${hackathonName}`)
        // Continue without template analysis if it fails - system remains functional
      }
    } else if (templateFile) {
      // If template file is provided but no analysis, analyze it now
      try {
        const analysis = await analyzeTemplateStructure(templateFile, additionalInfo || undefined)
        
        const templateAnalysis = new TemplateAnalysis({
          hackathonId: '', // Will be set after hackathon is created
          userId,
          templateFileName: templateFile.name,
          structure: analysis.structure,
          theme: analysis.theme,
          additionalContext: analysis.additionalContext,
          fingerprint: analysis.fingerprint,
        })
        
        await templateAnalysis.save()
        templateAnalysisId = templateAnalysis._id.toString()
        parsedTemplateAnalysis = analysis
        
        console.log(`✅ Template analysis completed for hackathon: ${hackathonName}`)
      } catch (error) {
        console.error('Failed to analyze template:', error)
        console.log(`⚠️ Continuing hackathon creation without template analysis for: ${hackathonName}`)
        // Continue without template analysis if it fails - system remains functional
      }
    }

    // Create hackathon record
    const hackathon = new Hackathon({
      userId,
      name: hackathonName,
      tracks: tracks.split(',').map(t => t.trim()).filter(Boolean),
      weights,
      additionalInfo,
      status: 'processing',
      templateAnalysis: templateAnalysisId || undefined,
    })

    await hackathon.save()
    
    // Update template analysis with hackathon ID
    if (templateAnalysisId) {
      await TemplateAnalysis.findByIdAndUpdate(templateAnalysisId, {
        hackathonId: hackathon._id.toString()
      })
    }

    // Generate batch ID for tracking
    const batchId = uuidv4()

    // Create evaluation records and queue jobs for each file
    const evaluationPromises = files.map(async (file, index) => {
      const evaluation = new Evaluation({
        userId,
        type: 'hackathon',
        fileName: file.name,
        domain: 'hackathon',
        hackathonId: hackathon._id.toString(),
        status: 'queued', // Changed from 'processing' to 'queued'
      })
      
      await evaluation.save()
      
      // Convert file to buffer for queue
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      
      // Create job for queue
      const job: HackathonEvaluationJob = {
        type: 'hackathon',
        evaluationId: evaluation._id.toString(),
        hackathonId: hackathon._id.toString(),
        userId,
        fileName: file.name,
        fileBuffer: fileBuffer.toString('base64'),
        weights,
        batchId,

        templateAnalysisId: templateAnalysisId || undefined,
        templateAnalysis: parsedTemplateAnalysis || undefined,
        includeTemplateValidation: templateAnalysisId ? true : false
      }

      // Add to queue with priority based on file order (first files get higher priority)
      const priority = Math.max(1, 10 - index) // Priority 10 to 1
      await addToQueue(QUEUES.HACKATHON_EVALUATION, job, priority)
      
      return evaluation._id.toString()
    })

    const evaluationIds = await Promise.all(evaluationPromises)
    
    // Update hackathon with evaluation IDs
    hackathon.evaluations = evaluationIds
    await hackathon.save()

    return NextResponse.json({ 
      hackathonId: hackathon._id.toString(),
      batchId,
      totalFiles: files.length,
      message: `${files.length} files uploaded successfully. Added to processing queue...`,
      status: 'queued'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Note: File processing is now handled by the queue worker
// See lib/processors/evaluationProcessor.ts for the actual processing logic