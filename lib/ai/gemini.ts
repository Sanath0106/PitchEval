import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface EvaluationResult {
  scores: {
    feasibility: number
    innovation: number
    impact: number
    clarity: number
    overall: number
  }
  suggestions: string[]
  trackRelevance?: {
    isRelevant: boolean
    matchedTracks: string[]
    relevanceScore: number
    reason: string
  }
}

// Direct file analysis with Gemini 2.0 Flash
export async function evaluatePresentationFile(file: File, domain: string, description?: string, tracks?: string[]): Promise<EvaluationResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  try {
    const mimeType = file.type || 'application/pdf'
    
    // Validate that the file is a PDF
    if (mimeType !== 'application/pdf') {
      throw new Error('Only PDF files are supported')
    }
    
    // Check if file type is supported by Gemini's file API
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif'
    ]
    
    let prompt = ''
    let contentParts: any[] = []
    
    if (supportedTypes.includes(mimeType) && !mimeType.includes('presentation')) {
      // Use file-based analysis for supported types
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Data = buffer.toString('base64')
      
      contentParts = [
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        },
        { text: getAnalysisPrompt(file.name, domain, description, tracks) }
      ]
    } else {
      // Use text-based analysis for PDF files
      const extractedText = await extractTextFromFile(file)
      
      prompt = getTextAnalysisPrompt(extractedText, file.name, domain, description, tracks)
      contentParts = [{ text: prompt }]
    }

    const result = await model.generateContent(contentParts)

    const response = result.response
    const text = response.text()

    // Extract and clean JSON from response
    // Try to find JSON block more carefully
    let jsonText = ''
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
      throw new Error('No valid JSON found in AI response')
    }
    
    jsonText = text.substring(jsonStart, jsonEnd + 1)
    
    // Clean up common JSON issues
    jsonText = jsonText
      .replace(/,\s*}/g, '}')  // Remove trailing commas
      .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
      .replace(/\n/g, ' ')     // Replace newlines with spaces
      .replace(/\r/g, '')      // Remove carriage returns
      .replace(/\t/g, ' ')     // Replace tabs with spaces
      .replace(/\s+/g, ' ')    // Normalize whitespace
    
    let evaluation
    try {
      evaluation = JSON.parse(jsonText)
    } catch (parseError) {
      throw new Error(`Failed to parse AI response: ${parseError}`)
    }

    // Calculate overall score as average
    const scores = evaluation.scores
    const overall = (scores.feasibility + scores.innovation + scores.impact + scores.clarity) / 4

    const evaluationResult: EvaluationResult = {
      scores: {
        feasibility: Math.min(10, Math.max(0, scores.feasibility)), // Allow 0 for invalid files
        innovation: Math.min(10, Math.max(0, scores.innovation)),
        impact: Math.min(10, Math.max(0, scores.impact)),
        clarity: Math.min(10, Math.max(0, scores.clarity)),
        overall: Math.round(overall * 10) / 10, // Round to 1 decimal
      },
      suggestions: evaluation.suggestions, // AI should handle suggestion count based on file validity
    }

    // Add track relevance if tracks were provided
    if (tracks && tracks.length > 0) {
      if (evaluation.trackRelevance) {
        evaluationResult.trackRelevance = {
          isRelevant: evaluation.trackRelevance.isRelevant,
          matchedTracks: evaluation.trackRelevance.matchedTracks || [],
          relevanceScore: Math.min(10, Math.max(1, evaluation.trackRelevance.relevanceScore || 0)),
          reason: evaluation.trackRelevance.reason || 'No reason provided'
        }
      } else {
        // If no track relevance was provided but tracks exist, default to disqualified
        evaluationResult.trackRelevance = {
          isRelevant: false,
          matchedTracks: [],
          relevanceScore: 1,
          reason: 'AI failed to determine track relevance - defaulting to disqualified for safety'
        }
      }
    }

    return evaluationResult

  } catch (error) {
    // Provide intelligent fallback based on domain and file type
    return getFallbackEvaluation(file.name, domain, description)
  }
}

// Helper function to extract text from files
async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'pdf') {
      // For PDF files, try to extract text (basic implementation)
      return `PDF file: ${file.name}. Content analysis based on file structure and metadata.`
    } else {
      return `PDF presentation: ${file.name}. Document format: ${fileExtension || 'pdf'}.`
    }
  } catch (error) {
    return `File: ${file.name}. Unable to extract detailed content.`
  }
}

// Helper function to get file-based analysis prompt
function getAnalysisPrompt(fileName: string, domain: string, description?: string, tracks?: string[]): string {
  return `
    🚨🚨🚨 STOP! BEFORE ANYTHING ELSE: 
    
    If you see GRADES, MARKS, SEMESTER, TRANSCRIPT, RESUME, CV, EDUCATION, WORK EXPERIENCE, SKILLS, CERTIFICATES, ID CARD, or PERSONAL INFO - IMMEDIATELY return this JSON and DO NOT CONTINUE:
    
    {"scores":{"feasibility":0,"innovation":0,"impact":0,"clarity":0,"overall":0},"suggestions":["INVALID FILE: This is a personal/academic document, not a project pitch. Upload a PROJECT PRESENTATION instead."]}

    You are a STRICT, UNBIASED pitch evaluation expert with 20+ years of experience in venture capital, startup acceleration, and hackathon judging. You have NO emotional attachment and provide brutally honest, data-driven feedback.

    ⚠️ CRITICAL INSTRUCTION: If this is NOT a project pitch presentation (e.g., resume, ID, certificate, manual), return EXACTLY this JSON with ONLY 1 suggestion and STOP:
    {"scores":{"feasibility":0,"innovation":0,"impact":0,"clarity":0,"overall":0},"suggestions":["INVALID FILE TYPE: This appears to be [document type] rather than a project pitch presentation. Please upload a presentation that introduces a project, startup idea, or product proposal with: problem statement, solution overview, market analysis, business model, and implementation plan."]}

    CRITICAL FILE TYPE VALIDATION (CHECK THIS FIRST):
    
    BEFORE EVALUATING ANYTHING, determine if this is a PROJECT PITCH PRESENTATION:
    
    IMMEDIATELY DISQUALIFY if the file contains:
    - Personal resume/CV content
    - Job application materials
    - Academic transcripts or certificates
    - Company brochures or marketing materials
    - Technical documentation or manuals
    - Research papers without implementation
    - Generic business documents
    - Personal portfolios (unless it's a pitch for a specific project)
    - Any content that is NOT a project/startup/product pitch
    
    ONLY PROCEED if the file is clearly:
    - A project pitch presentation
    - A startup business plan presentation
    - A product/service proposal
    - A hackathon project submission
    - A technology solution presentation
    
    If this is NOT a project pitch presentation, IMMEDIATELY return this exact JSON structure and STOP:
    {
      "scores": { "feasibility": 0, "innovation": 0, "impact": 0, "clarity": 0, "overall": 0 },
      "suggestions": ["INVALID FILE TYPE: This appears to be [type of document] rather than a project pitch presentation. Please upload a presentation that introduces a project, startup idea, or product proposal with: problem statement, solution overview, market analysis, business model, and implementation plan."]
    }

    TASK: Analyze this ${fileName} presentation file and provide a comprehensive evaluation ONLY if it passes the file type validation above.

    CONTEXT:
    - Domain: ${domain}
    - Additional Info: ${description || 'None provided'}
    ${tracks && tracks.length > 0 ? `- Hackathon Tracks: ${tracks.join(', ')}` : ''}

    ${tracks && tracks.length > 0 ? `
    MANDATORY TRACK RELEVANCE CHECK (EVALUATE THIS FIRST):
    
    ALLOWED HACKATHON TRACKS: ${tracks.join(', ')}
    
    DISQUALIFICATION RULES (BE RUTHLESS):
    1. If the presentation's MAIN TOPIC is not directly related to ANY track - DISQUALIFY (isRelevant: false)
    2. If it's a generic business idea without track-specific technology - DISQUALIFY
    3. If it's about a completely different domain - DISQUALIFY
    4. If you can't clearly identify which track it belongs to - DISQUALIFY
    5. DEFAULT TO DISQUALIFICATION - only allow if 100% certain it fits a track
    
    TRACK MATCHING EXAMPLES:
    - "AI/ML" track: Must use artificial intelligence, machine learning, neural networks, etc.
    - "Blockchain" track: Must use blockchain technology, crypto, smart contracts, etc.
    - "Healthcare" track: Must solve healthcare problems, medical technology, etc.
    - "Fintech" track: Must be financial technology, payments, banking, etc.
    
    AUTOMATIC DISQUALIFICATION EXAMPLES:
    - LTI document when tracks are "AI/ML, Blockchain" - DISQUALIFY
    - Food delivery app when tracks are "Healthcare, Education" - DISQUALIFY  
    - Generic business plan when tracks are "IoT, Cybersecurity" - DISQUALIFY
    - Random PDF document unrelated to any track - DISQUALIFY
    - Academic papers/research without implementation - DISQUALIFY
    - Company documentation/manuals - DISQUALIFY
    - Generic presentations without track-specific technology - DISQUALIFY
    
    STRICT VALIDATION KEYWORDS (Auto-disqualify if found without track relevance):
    - "LTI", "Learning Tools Interoperability" (unless Education track exists)
    - "Annual Report", "Financial Statement" (unless Fintech track exists)
    - "User Manual", "Documentation", "Guide" (unless specific tech track matches)
    - "Research Paper", "Academic Study" (unless implementation is shown)
    ` : ''}

    EVALUATION CRITERIA (Score 1-10, be STRICT - average presentations should score 5-6):

    1. FEASIBILITY: Technical viability, resource requirements, timeline realism, regulatory considerations
    2. INNOVATION: Novelty, differentiation from existing solutions, technological advancement
    3. IMPACT: Market size, user adoption potential, social/economic value creation
    4. CLARITY: Presentation structure, visual design, storytelling, data presentation

    SCORING GUIDELINES:
    - 1-3: Poor/Inadequate (major flaws, unrealistic, unclear)
    - 4-6: Average/Acceptable (standard approach, some issues)
    - 7-8: Good/Strong (well-executed, minor improvements needed)
    - 9-10: Excellent/Outstanding (exceptional quality, minimal flaws)

    Provide response in JSON format:
    {
      "scores": {
        "feasibility": <score 1-10>,
        "innovation": <score 1-10>, 
        "impact": <score 1-10>,
        "clarity": <score 1-10>,
        "overall": <calculated average>
      },
      "suggestions": [
        "WHAT TO ADD: [Specific missing element] - [Detailed explanation of why it's needed and how to implement it]",
        "WHAT TO REMOVE: [Specific problematic element] - [Explanation of why it's harmful and what to replace it with]",
        "WHAT TO IMPROVE: [Specific weak area] - [Detailed steps for improvement with examples]",
        "WHAT TO ADD: [Another missing element] - [Implementation guidance]",
        "WHAT TO REMOVE: [Another problematic element] - [Replacement strategy]",
        "WHAT TO IMPROVE: [Another weak area] - [Specific improvement steps]",
        "WHAT TO ADD: [Final missing element] - [Complete implementation guide]"
      ]${tracks && tracks.length > 0 ? `,
      "trackRelevance": {
        "isRelevant": <true/false - BE STRICT, DEFAULT TO FALSE>,
        "matchedTracks": [<array of matched track names, empty if not relevant>],
        "relevanceScore": <1-10, how well it matches the tracks>,
        "reason": "<detailed explanation of why it's relevant or not relevant>"
      }` : ''}
    }

    REQUIREMENTS for suggestions:
    - Start each with "WHAT TO ADD:", "WHAT TO REMOVE:", or "WHAT TO IMPROVE:"
    - Be specific about slide numbers, sections, or elements when possible
    - Provide actionable steps, not vague advice
    - Include examples, metrics, or frameworks
    - Be brutally honest about weaknesses
    - Suggest concrete alternatives for removed elements
  `
}

// Helper function to get text-based analysis prompt
function getTextAnalysisPrompt(text: string, fileName: string, domain: string, description?: string, tracks?: string[]): string {
  return `
    🚨🚨🚨 STOP! BEFORE ANYTHING ELSE: 
    
    If you see GRADES, MARKS, SEMESTER, TRANSCRIPT, RESUME, CV, EDUCATION, WORK EXPERIENCE, SKILLS, CERTIFICATES, ID CARD, or PERSONAL INFO - IMMEDIATELY return this JSON and DO NOT CONTINUE:
    
    {"scores":{"feasibility":0,"innovation":0,"impact":0,"clarity":0,"overall":0},"suggestions":["INVALID FILE: This is a personal/academic document, not a project pitch. Upload a PROJECT PRESENTATION instead."]}

    You are a STRICT, UNBIASED pitch evaluation expert with 20+ years of experience in venture capital, startup acceleration, and hackathon judging. You have NO emotional attachment and provide brutally honest, data-driven feedback.

    ⚠️ CRITICAL INSTRUCTION: If this is NOT a project pitch presentation (e.g., resume, ID, certificate, manual), return EXACTLY this JSON with ONLY 1 suggestion and STOP:
    {"scores":{"feasibility":0,"innovation":0,"impact":0,"clarity":0,"overall":0},"suggestions":["INVALID FILE TYPE: This appears to be [document type] rather than a project pitch presentation. Please upload a presentation that introduces a project, startup idea, or product proposal with: problem statement, solution overview, market analysis, business model, and implementation plan."]}

    CRITICAL FILE TYPE VALIDATION (CHECK THIS FIRST):
    
    BEFORE EVALUATING ANYTHING, determine if this is a PROJECT PITCH PRESENTATION:
    
    IMMEDIATELY DISQUALIFY if the content contains:
    - Personal resume/CV content (work experience, education, skills, personal achievements)
    - Job application materials or cover letters
    - Academic transcripts, certificates, or degree information
    - Company brochures or marketing materials
    - Technical documentation or user manuals
    - Research papers without implementation or product
    - Generic business documents or reports
    - Personal portfolios (unless it's a pitch for a specific project)
    - Any content that is NOT a project/startup/product pitch
    
    ONLY PROCEED if the content is clearly:
    - A project pitch presentation
    - A startup business plan presentation
    - A product/service proposal
    - A hackathon project submission
    - A technology solution presentation
    
    If this is NOT a project pitch presentation, IMMEDIATELY return this exact JSON structure and STOP:
    {
      "scores": { "feasibility": 0, "innovation": 0, "impact": 0, "clarity": 0, "overall": 0 },
      "suggestions": ["INVALID FILE TYPE: This appears to be [type of document] rather than a project pitch presentation. Please upload a presentation that introduces a project, startup idea, or product proposal with: problem statement, solution overview, market analysis, business model, and implementation plan."]
    }

    TASK: Analyze this presentation content from ${fileName} and provide a comprehensive evaluation ONLY if it passes the file type validation above.

    PRESENTATION CONTENT:
    ${text}

    CONTEXT:
    - Domain: ${domain}
    - Additional Info: ${description || 'None provided'}
    ${tracks && tracks.length > 0 ? `- Hackathon Tracks: ${tracks.join(', ')}` : ''}

    ${tracks && tracks.length > 0 ? `
    MANDATORY TRACK RELEVANCE CHECK (EVALUATE THIS FIRST):
    
    ALLOWED HACKATHON TRACKS: ${tracks.join(', ')}
    
    DISQUALIFICATION RULES (BE RUTHLESS):
    1. If the presentation's MAIN TOPIC is not directly related to ANY track - DISQUALIFY (isRelevant: false)
    2. If it's a generic business idea without track-specific technology - DISQUALIFY
    3. If it's about a completely different domain - DISQUALIFY
    4. If you can't clearly identify which track it belongs to - DISQUALIFY
    5. DEFAULT TO DISQUALIFICATION - only allow if 100% certain it fits a track
    
    TRACK MATCHING EXAMPLES:
    - "AI/ML" track: Must use artificial intelligence, machine learning, neural networks, etc.
    - "Blockchain" track: Must use blockchain technology, crypto, smart contracts, etc.
    - "Healthcare" track: Must solve healthcare problems, medical technology, etc.
    - "Fintech" track: Must be financial technology, payments, banking, etc.
    
    AUTOMATIC DISQUALIFICATION EXAMPLES:
    - LTI document when tracks are "AI/ML, Blockchain" - DISQUALIFY
    - Food delivery app when tracks are "Healthcare, Education" - DISQUALIFY  
    - Generic business plan when tracks are "IoT, Cybersecurity" → DISQUALIFY
    - Random PDF document unrelated to any track → DISQUALIFY
    - Academic papers/research without implementation → DISQUALIFY
    - Company documentation/manuals → DISQUALIFY
    - Generic presentations without track-specific technology → DISQUALIFY
    
    🔍 STRICT VALIDATION KEYWORDS (Auto-disqualify if found without track relevance):
    - "LTI", "Learning Tools Interoperability" (unless Education track exists)
    - "Annual Report", "Financial Statement" (unless Fintech track exists)
    - "User Manual", "Documentation", "Guide" (unless specific tech track matches)
    - "Research Paper", "Academic Study" (unless implementation is shown)
    ` : ''}

    EVALUATION CRITERIA (Score 1-10, be STRICT - average presentations should score 5-6):

    1. FEASIBILITY: Technical viability, resource requirements, timeline realism, regulatory considerations
    2. INNOVATION: Novelty, differentiation from existing solutions, technological advancement
    3. IMPACT: Market size, user adoption potential, social/economic value creation
    4. CLARITY: Presentation structure, visual design, storytelling, data presentation

    SCORING GUIDELINES:
    - 1-3: Poor/Inadequate (major flaws, unrealistic, unclear)
    - 4-6: Average/Acceptable (standard approach, some issues)
    - 7-8: Good/Strong (well-executed, minor improvements needed)
    - 9-10: Excellent/Outstanding (exceptional quality, minimal flaws)

    Provide response in JSON format:
    {
      "scores": {
        "feasibility": <score 1-10>,
        "innovation": <score 1-10>, 
        "impact": <score 1-10>,
        "clarity": <score 1-10>,
        "overall": <calculated average>
      },
      "suggestions": [
        "WHAT TO ADD: [Specific missing element] - [Detailed explanation of why it's needed and how to implement it]",
        "WHAT TO REMOVE: [Specific problematic element] - [Explanation of why it's harmful and what to replace it with]",
        "WHAT TO IMPROVE: [Specific weak area] - [Detailed steps for improvement with examples]",
        "WHAT TO ADD: [Another missing element] - [Implementation guidance]",
        "WHAT TO REMOVE: [Another problematic element] - [Replacement strategy]",
        "WHAT TO IMPROVE: [Another weak area] - [Specific improvement steps]",
        "WHAT TO ADD: [Final missing element] - [Complete implementation guide]"
      ]${tracks && tracks.length > 0 ? `,
      "trackRelevance": {
        "isRelevant": <true/false - BE STRICT, DEFAULT TO FALSE>,
        "matchedTracks": [<array of matched track names, empty if not relevant>],
        "relevanceScore": <1-10, how well it matches the tracks>,
        "reason": "<detailed explanation of why it's relevant or not relevant>"
      }` : ''}
    }

    REQUIREMENTS for suggestions:
    - Start each with "WHAT TO ADD:", "WHAT TO REMOVE:", or "WHAT TO IMPROVE:"
    - Be specific about slide numbers, sections, or elements when possible
    - Provide actionable steps, not vague advice
    - Include examples, metrics, or frameworks
    - Be brutally honest about weaknesses
    - Suggest concrete alternatives for removed elements
  `
}

// Intelligent fallback evaluation based on domain and file type
function getFallbackEvaluation(fileName: string, domain: string, description?: string): EvaluationResult {
  // Check if this looks like an invalid file type
  const invalidFilePatterns = [
    /resume|cv|curriculum/i,
    /transcript|certificate|diploma/i,
    /id|identity|passport|aadhar|aadhaar/i,
    /invoice|receipt|bill/i,
    /manual|documentation|guide/i
  ]
  
  const isInvalidFile = invalidFilePatterns.some(pattern => 
    pattern.test(fileName) || pattern.test(description || '')
  )
  
  if (isInvalidFile) {
    return {
      scores: {
        feasibility: 0,
        innovation: 0,
        impact: 0,
        clarity: 0,
        overall: 0
      },
      suggestions: [
        "INVALID FILE TYPE: This appears to be a personal document rather than a project pitch presentation. Please upload a presentation that introduces a project, startup idea, or product proposal with: problem statement, solution overview, market analysis, business model, and implementation plan."
      ]
    }
  }
  const domainScores: Record<string, any> = {
    'cybersecurity': { feasibility: 7.0, innovation: 6.5, impact: 8.0, clarity: 6.0 },
    'ai-ml': { feasibility: 6.5, innovation: 8.5, impact: 8.5, clarity: 6.5 },
    'blockchain': { feasibility: 6.0, innovation: 8.0, impact: 7.5, clarity: 6.0 },
    'web-development': { feasibility: 8.0, innovation: 6.0, impact: 7.0, clarity: 7.5 },
    'mobile-app': { feasibility: 7.5, innovation: 6.5, impact: 7.5, clarity: 7.0 },
    'fintech': { feasibility: 6.5, innovation: 7.0, impact: 8.5, clarity: 7.0 },
    'healthtech': { feasibility: 6.0, innovation: 7.5, impact: 9.0, clarity: 6.5 },
    'default': { feasibility: 7.0, innovation: 7.0, impact: 7.5, clarity: 6.5 }
  }

  const scores = domainScores[domain] || domainScores['default']
  const overall = (scores.feasibility + scores.innovation + scores.impact + scores.clarity) / 4

  const domainSuggestions: Record<string, string[]> = {
    'cybersecurity': [
      "WHAT TO ADD: Threat modeling section - Include detailed analysis of potential security threats, attack vectors, and risk assessment methodologies specific to your solution.",
      "WHAT TO IMPROVE: Security architecture diagram - Provide comprehensive security architecture showing encryption methods, access controls, and data protection mechanisms.",
      "WHAT TO ADD: Compliance framework mapping - Detail how your solution aligns with industry standards like ISO 27001, NIST, SOC 2, or relevant regulatory requirements.",
      "WHAT TO REMOVE: Generic security claims - Replace vague statements about 'military-grade security' with specific technical implementations and certifications.",
      "WHAT TO IMPROVE: Incident response plan - Elaborate on your security incident detection, response procedures, and recovery mechanisms.",
      "WHAT TO ADD: Penetration testing results - Include third-party security assessments, vulnerability scanning results, and remediation strategies.",
      "WHAT TO IMPROVE: User authentication flow - Strengthen multi-factor authentication, zero-trust architecture, and identity management implementation details."
    ],
    'ai-ml': [
      "WHAT TO ADD: Model architecture details - Include specific neural network architectures, training methodologies, and performance benchmarks with industry-standard metrics.",
      "WHAT TO IMPROVE: Data pipeline documentation - Provide comprehensive data collection, preprocessing, validation, and quality assurance processes.",
      "WHAT TO ADD: Bias mitigation strategies - Detail your approach to identifying, measuring, and reducing algorithmic bias in your AI models.",
      "WHAT TO REMOVE: Overhyped AI claims - Replace buzzwords with concrete technical specifications, accuracy metrics, and realistic capability statements.",
      "WHAT TO IMPROVE: Scalability analysis - Explain computational requirements, infrastructure needs, and performance optimization strategies for production deployment.",
      "WHAT TO ADD: Explainability framework - Include model interpretability methods, decision transparency, and user trust-building mechanisms.",
      "WHAT TO IMPROVE: Continuous learning system - Detail your model retraining pipeline, performance monitoring, and adaptation mechanisms."
    ],
    'default': [
      "WHAT TO ADD: Technical implementation roadmap - Provide detailed development phases, technology stack decisions, and architectural considerations for your solution.",
      "WHAT TO IMPROVE: Market validation evidence - Strengthen your presentation with customer interviews, pilot program results, and quantitative market research data.",
      "WHAT TO ADD: Competitive differentiation analysis - Include comprehensive competitor comparison, unique value propositions, and sustainable competitive advantages.",
      "WHAT TO REMOVE: Unrealistic projections - Replace overly optimistic timelines and financial forecasts with data-driven, conservative estimates.",
      "WHAT TO IMPROVE: Business model clarity - Elaborate on revenue streams, pricing strategy, customer acquisition costs, and unit economics.",
      "WHAT TO ADD: Risk assessment and mitigation - Detail potential challenges, market risks, technical hurdles, and your strategies to address them.",
      "WHAT TO IMPROVE: Team expertise presentation - Highlight relevant experience, domain knowledge, and key personnel qualifications for executing this project."
    ]
  }

  const suggestions = domainSuggestions[domain] || domainSuggestions['default']

  return {
    scores: {
      feasibility: Math.round(scores.feasibility * 10) / 10,
      innovation: Math.round(scores.innovation * 10) / 10,
      impact: Math.round(scores.impact * 10) / 10,
      clarity: Math.round(scores.clarity * 10) / 10,
      overall: Math.round(overall * 10) / 10,
    },
    suggestions: suggestions.slice(0, 7)
  }
}