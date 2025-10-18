import { NextRequest, NextResponse } from 'next/server'
import { analyzeTemplateStructure } from '../../../../lib/ai/templateAnalysis'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const templateFile = formData.get('templateFile') as File
    const additionalContext = formData.get('additionalContext') as string

    if (!templateFile) {
      return NextResponse.json({
        success: false,
        error: 'Template file is required'
      }, { status: 400 })
    }

    // Use the enhanced validation from templateAnalysis
    const { validateTemplateFile } = await import('../../../../lib/ai/templateAnalysis')
    const validation = validateTemplateFile(templateFile)
    
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: validation.error
      }, { status: 400 })
    }

    // Analyze template structure with enhanced error handling
    const analysis = await analyzeTemplateStructure(templateFile, additionalContext || undefined)

    return NextResponse.json({
      success: true,
      ...analysis
    })

  } catch (error) {
    console.error('Template analysis error:', error)
    
    // Provide user-friendly error messages
    let errorMessage = 'Template analysis failed'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Determine appropriate status code based on error type
      if (error.message.includes('timeout') || 
          error.message.includes('slides') || 
          error.message.includes('theme') ||
          error.message.includes('corrupted') ||
          error.message.includes('unreadable')) {
        statusCode = 422 // Unprocessable Entity
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode })
  }
}