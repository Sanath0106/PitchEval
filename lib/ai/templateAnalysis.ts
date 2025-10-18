import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface TemplateSection {
  slideNumber: number
  title: string
  contentType: string
  keywords: string[]
}

export interface TemplateTheme {
  primaryTheme: string
  keywords: string[]
  firstSlideContent: string
}

export interface TemplateStructure {
  totalSlides: number
  sections: TemplateSection[]
  expectedPageRange: { min: number, max: number }
}

export interface TemplateAnalysisResult {
  structure: TemplateStructure
  theme: TemplateTheme
  fingerprint: string
  additionalContext?: string
}

/**
 * Validates template file before analysis
 */
export function validateTemplateFile(templateFile: File): { isValid: boolean; error?: string } {
  // Check file type
  if (templateFile.type !== 'application/pdf') {
    return {
      isValid: false,
      error: 'Invalid file format. Only PDF files are supported for template analysis.'
    }
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (templateFile.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds limit. Template files must be under ${Math.round(maxSize / (1024 * 1024))}MB.`
    }
  }

  // Check minimum file size (empty file check)
  if (templateFile.size < 1024) { // Less than 1KB
    return {
      isValid: false,
      error: 'File appears to be empty or corrupted. Please upload a valid PDF template.'
    }
  }

  return { isValid: true }
}

/**
 * Analyzes a template PDF to extract structure, theme, and create a fingerprint
 * for use in bulk evaluation validation
 */
export async function analyzeTemplateStructure(
  templateFile: File, 
  additionalContext?: string
): Promise<TemplateAnalysisResult> {
  // Validate template file first
  const validation = validateTemplateFile(templateFile)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const mimeType = templateFile.type || 'application/pdf'

    // Convert file to base64 for analysis
    const bytes = await templateFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    const contentParts = [
      {
        inlineData: {
          mimeType,
          data: base64Data
        }
      },
      { text: getTemplateAnalysisPrompt(templateFile.name, additionalContext) }
    ]

    // Set timeout for AI analysis (30 seconds)
    const analysisPromise = model.generateContent(contentParts)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Template analysis timed out after 30 seconds')), 30000)
    })

    const result = await Promise.race([analysisPromise, timeoutPromise]) as any
    const response = result.response
    const text = response.text()

    // Extract and parse JSON response
    const jsonText = extractJsonFromResponse(text)
    const analysisData = JSON.parse(jsonText)

    // Validate minimum slide count
    if (!analysisData.structure || !analysisData.structure.totalSlides) {
      throw new Error('Unable to determine slide count from template. Please ensure the PDF contains readable slides.')
    }

    if (analysisData.structure.totalSlides < 3) {
      throw new Error(`Template must contain at least 3 slides for analysis. Found ${analysisData.structure.totalSlides} slides.`)
    }

    // Validate theme extraction
    if (!analysisData.theme || !analysisData.theme.primaryTheme) {
      throw new Error('Unable to extract theme from template. Please ensure the first slide contains clear title content.')
    }

    // Generate template fingerprint
    const fingerprint = generateTemplateFingerprint(analysisData.structure, analysisData.theme)

    return {
      structure: {
        totalSlides: analysisData.structure.totalSlides,
        sections: analysisData.structure.sections.map((section: any) => ({
          slideNumber: section.slideNumber,
          title: section.title,
          contentType: section.contentType,
          keywords: section.keywords || []
        })),
        expectedPageRange: {
          min: Math.max(1, analysisData.structure.totalSlides - 2),
          max: analysisData.structure.totalSlides + 3
        }
      },
      theme: {
        primaryTheme: analysisData.theme.primaryTheme,
        keywords: analysisData.theme.keywords || [],
        firstSlideContent: analysisData.theme.firstSlideContent
      },
      fingerprint,
      additionalContext
    }

  } catch (error) {
    // Provide specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Template analysis timed out. The file may be too complex or corrupted. Please try with a simpler template.')
      }
      if (error.message.includes('JSON')) {
        throw new Error('Failed to analyze template structure. The PDF may be corrupted or contain unreadable content.')
      }
      if (error.message.includes('slides') || error.message.includes('theme')) {
        throw error // Re-throw validation errors as-is
      }
    }
    
    throw new Error(`Template analysis failed: ${error instanceof Error ? error.message : 'Unknown error occurred during analysis'}`)
  }
}

/**
 * Extracts theme information specifically from the first slide of a template
 */
export async function extractThemeFromFirstSlide(templateFile: File): Promise<TemplateTheme> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const bytes = await templateFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    const contentParts = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
      },
      { text: getThemeExtractionPrompt(templateFile.name) }
    ]

    const result = await model.generateContent(contentParts)
    const response = result.response
    const text = response.text()

    const jsonText = extractJsonFromResponse(text)
    const themeData = JSON.parse(jsonText)

    return {
      primaryTheme: themeData.primaryTheme,
      keywords: themeData.keywords || [],
      firstSlideContent: themeData.firstSlideContent
    }

  } catch (error) {
    throw new Error(`Theme extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generates a unique fingerprint for a template based on its structure and theme
 */
export function generateTemplateFingerprint(structure: TemplateStructure, theme: TemplateTheme): string {
  // Create a deterministic fingerprint based on key template characteristics
  const structureHash = structure.sections
    .map(section => `${section.slideNumber}-${section.title}-${section.contentType}`)
    .join('|')
  
  const themeHash = `${theme.primaryTheme}-${theme.keywords.sort().join(',')}`
  const slideCountHash = `slides:${structure.totalSlides}`
  
  const combinedString = `${structureHash}::${themeHash}::${slideCountHash}`
  
  // Simple hash function for fingerprint generation
  let hash = 0
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16)
}

/**
 * Validates a submission against a learned template structure
 * @deprecated Use the enhanced validation engine from validationEngine.ts for new implementations
 */
export async function validateSubmissionAgainstTemplate(
  submissionFile: File,
  templateAnalysis: TemplateAnalysisResult,
  additionalContext?: string
): Promise<{
  themeMatch: { score: number; reasoning: string }
  structureAdherence: { score: number; deviations: string[] }
  overallCompliance: number
}> {
  // Import the enhanced validation engine
  const { validateSubmissionAgainstTemplate: enhancedValidate } = await import('./validationEngine')
  
  try {
    const enhancedResult = await enhancedValidate(submissionFile, templateAnalysis, additionalContext)
    
    // Convert enhanced result to legacy format for backward compatibility
    return {
      themeMatch: {
        score: enhancedResult.themeMatch.score,
        reasoning: enhancedResult.themeMatch.reasoning
      },
      structureAdherence: {
        score: enhancedResult.structureAdherence.score,
        deviations: enhancedResult.structureAdherence.deviations
      },
      overallCompliance: enhancedResult.overallCompliance
    }

  } catch (error) {
    throw new Error(`Template validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

// Prompt for comprehensive template analysis
function getTemplateAnalysisPrompt(fileName: string, additionalContext?: string): string {
  return `
    You are an expert presentation structure analyst. Analyze this template PDF file "${fileName}" and extract its structural patterns, theme, and key characteristics.

    ${additionalContext ? `Additional Context: ${additionalContext}` : ''}

    ANALYSIS REQUIREMENTS:

    1. STRUCTURE ANALYSIS:
       - Count total slides
       - Identify each slide's main section/purpose
       - Determine content type for each slide (title, content, conclusion, etc.)
       - Extract key section titles and their slide numbers
       - Identify recurring patterns or themes

    2. THEME EXTRACTION:
       - Analyze the first slide to determine the primary presentation theme
       - Extract key keywords that define the topic/domain
       - Capture the main title and subtitle content
       - Identify the presentation's subject matter

    3. STRUCTURAL PATTERNS:
       - Note the presentation flow and organization
       - Identify required vs optional sections
       - Determine typical content expectations for each section

    Provide response in JSON format:
    {
      "structure": {
        "totalSlides": <number>,
        "sections": [
          {
            "slideNumber": <number>,
            "title": "<section title or main heading>",
            "contentType": "<title|introduction|problem|solution|demo|market|team|financials|conclusion|other>",
            "keywords": ["<key1>", "<key2>", "<key3>"]
          }
        ]
      },
      "theme": {
        "primaryTheme": "<main topic/domain of the presentation>",
        "keywords": ["<theme-keyword1>", "<theme-keyword2>", "<theme-keyword3>"],
        "firstSlideContent": "<title and main content from first slide>"
      }
    }

    REQUIREMENTS:
    - Be precise about slide numbers and section titles
    - Extract actual text content, not generic descriptions
    - Focus on structural patterns that can be used for validation
    - Identify the core theme that submissions should match
    - Include relevant keywords for each section
  `
}

// Prompt for theme extraction only
function getThemeExtractionPrompt(fileName: string): string {
  return `
    You are an expert at identifying presentation themes. Analyze the first slide of this template PDF "${fileName}" and extract the primary theme and key characteristics.

    FOCUS ON:
    - Main title and subtitle
    - Primary topic or domain
    - Key keywords that define the subject matter
    - Overall theme that submissions should match

    Provide response in JSON format:
    {
      "primaryTheme": "<main topic/domain>",
      "keywords": ["<keyword1>", "<keyword2>", "<keyword3>"],
      "firstSlideContent": "<actual title and content from first slide>"
    }

    Be specific and extract actual content, not generic descriptions.
  `
}

// Prompt for submission validation against template
function getValidationPrompt(fileName: string, templateAnalysis: TemplateAnalysisResult): string {
  return `
    You are a presentation validation expert. Compare this submission "${fileName}" against the learned template structure and theme.

    TEMPLATE REFERENCE:
    Theme: ${templateAnalysis.theme.primaryTheme}
    Keywords: ${templateAnalysis.theme.keywords.join(', ')}
    Expected Slides: ${templateAnalysis.structure.totalSlides}
    Expected Sections: ${templateAnalysis.structure.sections.map(s => `${s.slideNumber}: ${s.title} (${s.contentType})`).join(', ')}

    VALIDATION CRITERIA:

    1. THEME MATCHING (Score 0-10):
       - Does the first slide match the expected theme?
       - Are the key topic keywords present?
       - Is the subject matter aligned with the template?

    2. STRUCTURE ADHERENCE (Score 0-10):
       - Does the slide count match expectations (${templateAnalysis.structure.expectedPageRange.min}-${templateAnalysis.structure.expectedPageRange.max})?
       - Are the expected sections present?
       - Does the flow match the template structure?

    Provide response in JSON format:
    {
      "themeMatch": {
        "score": <0-10>,
        "reasoning": "<detailed explanation of theme alignment>"
      },
      "structureAdherence": {
        "score": <0-10>,
        "deviations": ["<specific deviation 1>", "<specific deviation 2>"]
      }
    }

    Be strict but fair in scoring. Provide specific reasons for deductions.
  `
}