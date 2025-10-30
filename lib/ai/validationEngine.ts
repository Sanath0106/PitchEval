import { GoogleGenerativeAI } from '@google/generative-ai'
import { TemplateAnalysisResult, TemplateTheme, TemplateStructure } from './templateAnalysis'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface ValidationResult {
  themeMatch: {
    score: number // 0-10
    reasoning: string
    keywordMatches: string[]
    missingKeywords: string[]
  }
  structureAdherence: {
    score: number // 0-10
    deviations: string[]
    slideCountMatch: boolean
    sectionMatches: SectionMatch[]
  }
  overallCompliance: number // 0-10
  recommendations: string[]
}

export interface SectionMatch {
  expectedSection: string
  found: boolean
  actualSlide?: number
  contentMatch: number // 0-10
}

/**
 * Enhanced validation engine for submissions against template structure
 * Implements comprehensive theme matching and structure adherence checking with fallback mechanisms
 */
export async function validateSubmissionAgainstTemplate(
  submissionFile: File,
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): Promise<ValidationResult> {
  // Validation attempt - debug logging removed for security
  
  try {
    return await performValidationWithFallback(submissionFile, templateAnalysis, additionalContext)
  } catch (error) {
    console.error(`Template validation failed for ${submissionFile.name}:`, error)
    
    // Return fallback validation result instead of throwing
    return createFallbackValidationResult(submissionFile.name, error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Performs validation with multiple fallback strategies
 */
async function performValidationWithFallback(
  submissionFile: File,
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): Promise<ValidationResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const bytes = await submissionFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    const contentParts = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      { text: getEnhancedValidationPrompt(submissionFile.name, templateAnalysis, additionalContext) }
    ]

    // Set timeout for validation (20 seconds)
    const validationPromise = model.generateContent(contentParts)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), 20000)
    })

    const result = await Promise.race([validationPromise, timeoutPromise]) as any
    const response = result.response
    const text = response.text()

    const jsonText = extractJsonFromResponse(text)
    const validationData = JSON.parse(jsonText)

    // Calculate overall compliance with weighted scoring
    const themeWeight = 0.4
    const structureWeight = 0.6
    const overallCompliance = Math.round(
      (validationData.themeMatch.score * themeWeight + 
       validationData.structureAdherence.score * structureWeight)
    )

    return {
      themeMatch: {
        score: Math.min(10, Math.max(0, validationData.themeMatch.score)),
        reasoning: validationData.themeMatch.reasoning,
        keywordMatches: validationData.themeMatch.keywordMatches || [],
        missingKeywords: validationData.themeMatch.missingKeywords || []
      },
      structureAdherence: {
        score: Math.min(10, Math.max(0, validationData.structureAdherence.score)),
        deviations: validationData.structureAdherence.deviations || [],
        slideCountMatch: validationData.structureAdherence.slideCountMatch || false,
        sectionMatches: validationData.structureAdherence.sectionMatches || []
      },
      overallCompliance: Math.min(10, Math.max(0, overallCompliance)),
      recommendations: validationData.recommendations || []
    }

  } catch (error) {
    console.error(`Primary validation failed, attempting fallback strategies:`, error)
    
    // Try fallback validation strategies
    if (error instanceof Error && error.message.includes('timeout')) {
      return await attemptSimplifiedValidation(submissionFile, templateAnalysis, additionalContext)
    }
    
    if (error instanceof Error && error.message.includes('JSON')) {
      return await attemptBasicValidation(submissionFile, templateAnalysis, additionalContext)
    }
    
    // If all strategies fail, throw the original error
    throw error
  }
}

/**
 * Simplified validation with reduced complexity for timeout cases
 */
async function attemptSimplifiedValidation(
  submissionFile: File,
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): Promise<ValidationResult> {
  // Simplified validation attempt - debug logging removed for security
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const bytes = await submissionFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    const contentParts = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      { text: getSimplifiedValidationPrompt(submissionFile.name, templateAnalysis, additionalContext) }
    ]

    // Shorter timeout for simplified validation
    const validationPromise = model.generateContent(contentParts)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Simplified validation timeout')), 10000)
    })

    const result = await Promise.race([validationPromise, timeoutPromise]) as any
    const response = result.response
    const text = response.text()

    const jsonText = extractJsonFromResponse(text)
    const validationData = JSON.parse(jsonText)

    return {
      themeMatch: {
        score: Math.min(10, Math.max(0, validationData.themeMatch?.score || 5)),
        reasoning: validationData.themeMatch?.reasoning || 'Simplified validation performed due to complexity',
        keywordMatches: validationData.themeMatch?.keywordMatches || [],
        missingKeywords: validationData.themeMatch?.missingKeywords || []
      },
      structureAdherence: {
        score: Math.min(10, Math.max(0, validationData.structureAdherence?.score || 5)),
        deviations: validationData.structureAdherence?.deviations || ['Detailed analysis unavailable'],
        slideCountMatch: validationData.structureAdherence?.slideCountMatch || false,
        sectionMatches: validationData.structureAdherence?.sectionMatches || []
      },
      overallCompliance: Math.min(10, Math.max(0, validationData.overallCompliance || 5)),
      recommendations: validationData.recommendations || ['Standard evaluation completed due to validation complexity']
    }

  } catch (error) {
    console.error(`Simplified validation also failed:`, error)
    throw error
  }
}

/**
 * Basic validation using template metadata only
 */
async function attemptBasicValidation(
  submissionFile: File,
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): Promise<ValidationResult> {
  // Basic validation attempt - debug logging removed for security
  
  // Basic validation based on template metadata without AI analysis
  const basicScore = 6 // Neutral score when detailed analysis fails
  
  return {
    themeMatch: {
      score: basicScore,
      reasoning: `Basic validation performed. Expected theme: ${templateAnalysis.theme.primaryTheme}. Detailed analysis unavailable.`,
      keywordMatches: [],
      missingKeywords: templateAnalysis.theme.keywords
    },
    structureAdherence: {
      score: basicScore,
      deviations: [`Expected ${templateAnalysis.structure.totalSlides} slides`, 'Detailed structure analysis unavailable'],
      slideCountMatch: false,
      sectionMatches: templateAnalysis.structure.sections.map(section => ({
        expectedSection: section.title,
        found: false,
        contentMatch: 0
      }))
    },
    overallCompliance: basicScore,
    recommendations: [
      'Template validation was limited due to analysis complexity',
      'Manual review recommended for accurate compliance assessment',
      `Ensure presentation follows the expected theme: ${templateAnalysis.theme.primaryTheme}`
    ]
  }
}

/**
 * Creates a fallback validation result when all validation attempts fail
 */
function createFallbackValidationResult(fileName: string, errorMessage: string): ValidationResult {
  // Fallback validation result - debug logging removed for security
  
  return {
    themeMatch: {
      score: 5, // Neutral score
      reasoning: `Template validation failed: ${errorMessage}. Standard evaluation criteria applied.`,
      keywordMatches: [],
      missingKeywords: []
    },
    structureAdherence: {
      score: 5, // Neutral score
      deviations: ['Template validation unavailable'],
      slideCountMatch: false,
      sectionMatches: []
    },
    overallCompliance: 5, // Neutral score
    recommendations: [
      'Template validation was not available for this submission',
      'Standard evaluation criteria were applied instead',
      'Manual review may be needed for template compliance assessment'
    ]
  }
}

/**
 * Checks if template validation should be skipped due to system constraints
 */
export function shouldSkipTemplateValidation(templateAnalysis?: any): boolean {
  if (!templateAnalysis) {
    return true
  }
  
  // Skip if template analysis is incomplete
  if (!templateAnalysis.structure || !templateAnalysis.theme) {
    // Skipping template validation: incomplete template analysis
    return true
  }
  
  // Skip if template has insufficient data
  if (!templateAnalysis.structure.totalSlides || templateAnalysis.structure.totalSlides < 3) {
    // Skipping template validation: insufficient template slides
    return true
  }
  
  return false
}

/**
 * Logs validation errors for debugging purposes
 */
export function logValidationError(fileName: string, error: Error, context: string): void {
  console.error(`Template validation error for ${fileName} (${context}):`, {
    message: error.message,
    stack: error.stack?.split('\n').slice(0, 3).join('\n'), // First 3 lines of stack
    timestamp: new Date().toISOString()
  })
}

/**
 * Theme matching algorithm specifically for first slide analysis
 * Implements sophisticated keyword matching and semantic similarity
 */
export async function analyzeThemeMatch(
  submissionFile: File,
  templateTheme: TemplateTheme,
  additionalContext?: string
): Promise<{
  score: number
  reasoning: string
  keywordMatches: string[]
  missingKeywords: string[]
  semanticSimilarity: number
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const bytes = await submissionFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    const contentParts = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      { text: getThemeMatchingPrompt(templateTheme, additionalContext) }
    ]

    const result = await model.generateContent(contentParts)
    const response = result.response
    const text = response.text()

    const jsonText = extractJsonFromResponse(text)
    const themeData = JSON.parse(jsonText)

    return {
      score: Math.min(10, Math.max(0, themeData.score)),
      reasoning: themeData.reasoning,
      keywordMatches: themeData.keywordMatches || [],
      missingKeywords: themeData.missingKeywords || [],
      semanticSimilarity: Math.min(10, Math.max(0, themeData.semanticSimilarity || 0))
    }

  } catch (error) {
    throw new Error(`Theme matching analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Structure adherence checking with detailed section-by-section analysis
 */
export async function analyzeStructureAdherence(
  submissionFile: File,
  templateStructure: TemplateStructure,
  additionalContext?: string
): Promise<{
  score: number
  deviations: string[]
  slideCountMatch: boolean
  sectionMatches: SectionMatch[]
  flowAnalysis: string
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const bytes = await submissionFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    const contentParts = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      { text: getStructureAnalysisPrompt(templateStructure, additionalContext) }
    ]

    const result = await model.generateContent(contentParts)
    const response = result.response
    const text = response.text()

    const jsonText = extractJsonFromResponse(text)
    const structureData = JSON.parse(jsonText)

    return {
      score: Math.min(10, Math.max(0, structureData.score)),
      deviations: structureData.deviations || [],
      slideCountMatch: structureData.slideCountMatch || false,
      sectionMatches: structureData.sectionMatches || [],
      flowAnalysis: structureData.flowAnalysis || ''
    }

  } catch (error) {
    throw new Error(`Structure adherence analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate validation scores and deviation reports
 * Combines theme and structure analysis into comprehensive report
 */
export function generateValidationReport(
  themeResult: any,
  structureResult: any,
  templateAnalysis: TemplateAnalysisResult
): {
  summary: string
  detailedFindings: string[]
  recommendations: string[]
  complianceLevel: 'high' | 'medium' | 'low'
} {
  const overallScore = (themeResult.score + structureResult.score) / 2
  
  let complianceLevel: 'high' | 'medium' | 'low'
  if (overallScore >= 8) complianceLevel = 'high'
  else if (overallScore >= 6) complianceLevel = 'medium'
  else complianceLevel = 'low'

  const summary = `Template compliance: ${overallScore.toFixed(1)}/10 (${complianceLevel}). ` +
    `Theme match: ${themeResult.score}/10, Structure adherence: ${structureResult.score}/10.`

  const detailedFindings = [
    `Theme Analysis: ${themeResult.reasoning}`,
    `Keyword Matches: ${themeResult.keywordMatches.join(', ') || 'None'}`,
    `Missing Keywords: ${themeResult.missingKeywords.join(', ') || 'None'}`,
    `Structure Deviations: ${structureResult.deviations.join('; ') || 'None'}`,
    `Slide Count Match: ${structureResult.slideCountMatch ? 'Yes' : 'No'}`,
    `Flow Analysis: ${structureResult.flowAnalysis || 'Standard flow maintained'}`
  ]

  const recommendations = []
  
  if (themeResult.score < 7) {
    recommendations.push('Consider revising the first slide to better align with the expected theme')
    if (themeResult.missingKeywords.length > 0) {
      recommendations.push(`Include these key terms: ${themeResult.missingKeywords.join(', ')}`)
    }
  }
  
  if (structureResult.score < 7) {
    recommendations.push('Review the presentation structure to match the template format')
    if (structureResult.deviations.length > 0) {
      recommendations.push('Address the following structural issues: ' + structureResult.deviations.join('; '))
    }
  }
  
  if (!structureResult.slideCountMatch) {
    const expected = templateAnalysis.structure.expectedPageRange
    recommendations.push(`Consider adjusting slide count to ${expected.min}-${expected.max} slides`)
  }

  return {
    summary,
    detailedFindings,
    recommendations,
    complianceLevel
  }
}

// Helper function to extract JSON from AI response
function extractJsonFromResponse(text: string): string {
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  
  if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
    throw new Error('No valid JSON found in AI response')
  }
  
  let jsonText = text.substring(jsonStart, jsonEnd + 1)
  
  // Clean up common JSON issues
  jsonText = jsonText
    .replace(/,\s*}/g, '}')  // Remove trailing commas
    .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
    .replace(/\n/g, ' ')     // Replace newlines with spaces
    .replace(/\r/g, '')      // Remove carriage returns
    .replace(/\t/g, ' ')     // Replace tabs with spaces
    .replace(/\s+/g, ' ')    // Normalize whitespace
  
  return jsonText
}

// Enhanced validation prompt with comprehensive analysis
function getEnhancedValidationPrompt(
  fileName: string, 
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): string {
  return `
    You are an expert presentation validation system. Perform comprehensive validation of this submission "${fileName}" against the learned template structure and theme.

    TEMPLATE REFERENCE:
    Primary Theme: ${templateAnalysis.theme.primaryTheme}
    Theme Keywords: ${templateAnalysis.theme.keywords.join(', ')}
    First Slide Content: ${templateAnalysis.theme.firstSlideContent}
    Expected Slides: ${templateAnalysis.structure.totalSlides} (range: ${templateAnalysis.structure.expectedPageRange.min}-${templateAnalysis.structure.expectedPageRange.max})
    
    Expected Sections:
    ${templateAnalysis.structure.sections.map(s => `- Slide ${s.slideNumber}: ${s.title} (${s.contentType}) - Keywords: ${s.keywords.join(', ')}`).join('\n    ')}

    ${additionalContext ? `Additional Context: ${additionalContext}` : ''}
    ${templateAnalysis.additionalContext ? `Template Context: ${templateAnalysis.additionalContext}` : ''}

    COMPREHENSIVE VALIDATION CRITERIA:

    1. THEME MATCHING ANALYSIS (Score 0-10):
       - Analyze the first slide for theme alignment
       - Check for presence of expected keywords
       - Evaluate semantic similarity to template theme
       - Identify missing critical keywords
       - Consider additional context in theme evaluation

    2. STRUCTURE ADHERENCE ANALYSIS (Score 0-10):
       - Verify slide count within expected range
       - Check for presence of expected sections
       - Analyze section order and flow
       - Evaluate content type matching for each section
       - Identify structural deviations

    3. SECTION-BY-SECTION MATCHING:
       - For each expected section, determine if it exists
       - Rate content match quality (0-10) for found sections
       - Note any missing or extra sections

    Provide response in JSON format:
    {
      "themeMatch": {
        "score": <0-10>,
        "reasoning": "<detailed explanation of theme alignment>",
        "keywordMatches": ["<matched keyword 1>", "<matched keyword 2>"],
        "missingKeywords": ["<missing keyword 1>", "<missing keyword 2>"],
        "semanticSimilarity": <0-10>
      },
      "structureAdherence": {
        "score": <0-10>,
        "deviations": ["<specific deviation 1>", "<specific deviation 2>"],
        "slideCountMatch": <true/false>,
        "sectionMatches": [
          {
            "expectedSection": "<section name>",
            "found": <true/false>,
            "actualSlide": <slide number if found>,
            "contentMatch": <0-10>
          }
        ],
        "flowAnalysis": "<analysis of presentation flow and organization>"
      },
      "recommendations": ["<recommendation 1>", "<recommendation 2>"]
    }

    SCORING GUIDELINES:
    - Theme Score: 9-10 (Perfect match), 7-8 (Good match), 5-6 (Partial match), 3-4 (Poor match), 0-2 (No match)
    - Structure Score: 9-10 (All sections present, correct order), 7-8 (Most sections present), 5-6 (Some sections missing), 3-4 (Major deviations), 0-2 (Completely different structure)
    - Be specific about deviations and provide actionable recommendations
  `
}

// Specialized theme matching prompt
function getThemeMatchingPrompt(templateTheme: TemplateTheme, additionalContext?: string): string {
  return `
    You are a theme matching specialist. Analyze the first slide of this submission and compare it against the expected template theme.

    EXPECTED THEME:
    Primary Theme: ${templateTheme.primaryTheme}
    Keywords: ${templateTheme.keywords.join(', ')}
    Reference Content: ${templateTheme.firstSlideContent}

    ${additionalContext ? `Additional Context: ${additionalContext}` : ''}

    ANALYSIS FOCUS:
    - Extract the main theme/topic from the first slide
    - Identify which expected keywords are present
    - Note which critical keywords are missing
    - Evaluate semantic similarity to the expected theme
    - Consider context variations that might still be valid

    Provide response in JSON format:
    {
      "score": <0-10>,
      "reasoning": "<detailed theme comparison>",
      "keywordMatches": ["<matched keywords>"],
      "missingKeywords": ["<missing critical keywords>"],
      "semanticSimilarity": <0-10>
    }
  `
}

// Specialized structure analysis prompt
function getStructureAnalysisPrompt(templateStructure: TemplateStructure, additionalContext?: string): string {
  return `
    You are a presentation structure analyst. Analyze this submission's structure and compare it against the expected template format.

    EXPECTED STRUCTURE:
    Total Slides: ${templateStructure.totalSlides}
    Expected Range: ${templateStructure.expectedPageRange.min}-${templateStructure.expectedPageRange.max} slides
    
    Expected Sections:
    ${templateStructure.sections.map(s => `- Slide ${s.slideNumber}: ${s.title} (${s.contentType})`).join('\n    ')}

    ${additionalContext ? `Additional Context: ${additionalContext}` : ''}

    ANALYSIS REQUIREMENTS:
    - Count total slides and check against expected range
    - Identify each slide's main purpose/section
    - Match sections to expected template sections
    - Note any missing, extra, or reordered sections
    - Evaluate overall presentation flow

    Provide response in JSON format:
    {
      "score": <0-10>,
      "deviations": ["<specific structural issues>"],
      "slideCountMatch": <true/false>,
      "sectionMatches": [
        {
          "expectedSection": "<section name>",
          "found": <true/false>,
          "actualSlide": <slide number>,
          "contentMatch": <0-10>
        }
      ],
      "flowAnalysis": "<evaluation of presentation organization and flow>"
    }
  `
}

// Simplified validation prompt for timeout/complexity cases
function getSimplifiedValidationPrompt(
  fileName: string, 
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): string {
  return `
    You are performing a quick validation check of this submission "${fileName}" against a template.

    TEMPLATE REFERENCE:
    Theme: ${templateAnalysis.theme.primaryTheme}
    Expected Slides: ${templateAnalysis.structure.totalSlides}
    Key Sections: ${templateAnalysis.structure.sections.slice(0, 3).map(s => s.title).join(', ')}

    ${additionalContext ? `Context: ${additionalContext}` : ''}

    QUICK VALIDATION (provide scores 0-10):
    1. Does the first slide match the expected theme?
    2. Is the slide count reasonable?
    3. Overall compliance estimate?

    Provide response in JSON format:
    {
      "themeMatch": {
        "score": <0-10>,
        "reasoning": "<brief theme assessment>"
      },
      "structureAdherence": {
        "score": <0-10>,
        "deviations": ["<major issues only>"],
        "slideCountMatch": <true/false>
      },
      "overallCompliance": <0-10>,
      "recommendations": ["<key recommendations>"]
    }

    Keep analysis brief and focused on major compliance issues only.
  `
}