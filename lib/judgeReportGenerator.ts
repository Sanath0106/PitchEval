import jsPDF from 'jspdf'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface JudgeEvaluationData {
  fileName: string
  domain: string
  detectedDomain?: {
    category: string
    confidence: number
    reason: string
  }
  projectSummary?: string
  scores: {
    feasibility: number
    innovation: number
    impact: number
    clarity: number
    overall: number
  }
  suggestions: string[]
  createdAt: Date
  hackathonId?: string
}

interface ProjectAnalysis {
  projectName: string
  description: string
  keyFeatures: string[]
  wowFactor: string
  usp: string
  roiPotential: string
  targetMarket: string
  businessModel: string
}

// Generate detailed project analysis using AI
async function generateProjectAnalysis(evaluation: JudgeEvaluationData): Promise<ProjectAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  const projectName = evaluation.fileName.replace(/\.[^/.]+$/, '')
  const displayDomain = evaluation.detectedDomain?.category && evaluation.detectedDomain.category !== 'auto-detect' 
    ? evaluation.detectedDomain.category 
    : (evaluation.domain === 'auto-detect' ? 'Multi-Domain Project' : evaluation.domain)

  const prompt = `
    You are a business analyst creating a comprehensive project report for judges. Based on the evaluation data provided, generate a detailed analysis of this project.

    PROJECT INFORMATION:
    - Project Name: ${projectName}
    - Domain/Category: ${displayDomain}
    - Overall Score: ${evaluation.scores.overall}/10
    - Feasibility: ${evaluation.scores.feasibility}/10
    - Innovation: ${evaluation.scores.innovation}/10
    - Impact: ${evaluation.scores.impact}/10
    - Clarity: ${evaluation.scores.clarity}/10
    
    ${evaluation.detectedDomain?.reason ? `- AI Detection Reason: ${evaluation.detectedDomain.reason}` : ''}
    
    SUGGESTIONS PROVIDED:
    ${evaluation.suggestions.join('\n')}

    Generate a comprehensive project analysis in JSON format:
    {
      "projectName": "${projectName}",
      "description": "A clear, comprehensive 2-3 sentence description of what this project does and solves",
      "keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
      "wowFactor": "The most impressive or innovative aspect that makes this project stand out",
      "usp": "Unique Selling Proposition - what makes this different from competitors",
      "roiPotential": "Return on Investment potential and business value proposition",
      "targetMarket": "Primary target audience and market size potential",
      "businessModel": "How this project generates revenue or creates value"
    }

    REQUIREMENTS:
    - Be specific and detailed based on the domain and scores
    - Make it sound professional and judge-friendly
    - Focus on business viability and market potential
    - Use the scores to infer project quality and potential
    - If scores are low, be realistic about limitations
    - If scores are high, highlight the strong points
  `

  try {
    const result = await model.generateContent([{ text: prompt }])
    const response = result.response.text()
    
    // Extract JSON from response
    const jsonStart = response.indexOf('{')
    const jsonEnd = response.lastIndexOf('}')
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No valid JSON found')
    }
    
    const jsonText = response.substring(jsonStart, jsonEnd + 1)
    const analysis = JSON.parse(jsonText)
    
    return analysis
  } catch (error) {
    console.error('Failed to generate project analysis:', error)
    
    // Fallback analysis based on domain and scores
    return {
      projectName,
      description: `This is a ${displayDomain.toLowerCase()} project that demonstrates ${evaluation.scores.overall >= 7 ? 'strong potential' : evaluation.scores.overall >= 5 ? 'moderate potential' : 'basic implementation'} with a focus on solving domain-specific challenges.`,
      keyFeatures: [
        `${displayDomain} implementation`,
        'User-focused design',
        'Scalable architecture',
        'Market-ready solution'
      ],
      wowFactor: evaluation.scores.innovation >= 7 ? 'Innovative approach to solving existing problems' : 'Practical solution with clear implementation path',
      usp: `Specialized ${displayDomain.toLowerCase()} solution with ${evaluation.scores.feasibility >= 7 ? 'strong technical foundation' : 'practical approach'}`,
      roiPotential: evaluation.scores.impact >= 7 ? 'High ROI potential with significant market impact' : evaluation.scores.impact >= 5 ? 'Moderate ROI with niche market appeal' : 'Limited ROI, requires market validation',
      targetMarket: `${displayDomain} market segment with growth potential`,
      businessModel: evaluation.scores.impact >= 6 ? 'Subscription/SaaS model with recurring revenue' : 'One-time licensing or service-based model'
    }
  }
}

export async function generateJudgeReport(evaluation: JudgeEvaluationData, hackathonName?: string): Promise<Buffer> {
  // Generate detailed project analysis
  const projectAnalysis = await generateProjectAnalysis(evaluation)
  
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Professional color scheme
  const blue = [59, 130, 246] as [number, number, number]
  const darkGray = [45, 45, 45] as [number, number, number]
  const mediumGray = [120, 120, 120] as [number, number, number]
  const lightGray = [240, 240, 240] as [number, number, number]
  const white = [255, 255, 255] as [number, number, number]
  const green = [34, 197, 94] as [number, number, number]
  const orange = [249, 115, 22] as [number, number, number]
  const red = [239, 68, 68] as [number, number, number]

  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  // Helper functions
  const getRating = (score: number): string => {
    if (score >= 8.5) return 'OUTSTANDING'
    if (score >= 7.5) return 'EXCELLENT'
    if (score >= 6.5) return 'GOOD'
    if (score >= 5.5) return 'SATISFACTORY'
    return 'NEEDS IMPROVEMENT'
  }

  const getRatingColor = (score: number): [number, number, number] => {
    if (score >= 8.5) return green
    if (score >= 7.5) return blue
    if (score >= 6.5) return orange
    return red
  }

  // PAGE 1: PROJECT OVERVIEW
  // Header
  doc.setFillColor(...blue)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(...white)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('JUDGE EVALUATION REPORT', margin, 20)

  if (hackathonName) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(hackathonName, pageWidth - margin - doc.getTextWidth(hackathonName), 20)
  }

  let yPos = 50

  // Project Title
  doc.setTextColor(...darkGray)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(projectAnalysis.projectName, margin, yPos)
  yPos += 25

  // Overall Score - Large Display
  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, yPos, contentWidth, 40, 5, 5, 'F')
  
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('OVERALL SCORE', margin + 10, yPos + 15)

  const overallScore = evaluation.scores.overall
  doc.setTextColor(...getRatingColor(overallScore))
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(`${overallScore.toFixed(1)}/10`, margin + 10, yPos + 32)

  doc.setTextColor(...getRatingColor(overallScore))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(getRating(overallScore), margin + 80, yPos + 32)

  yPos += 60

  // Project Details
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PROJECT DETAILS', margin, yPos)
  yPos += 15

  const displayDomain = evaluation.detectedDomain?.category && evaluation.detectedDomain.category !== 'auto-detect' 
    ? evaluation.detectedDomain.category 
    : (evaluation.domain === 'auto-detect' ? 'Multi-Domain Project' : evaluation.domain)

  const details = [
    ['Project Name:', projectAnalysis.projectName],
    ['Theme/Category:', displayDomain],
    ['Evaluation Date:', new Date(evaluation.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })]
  ]

  details.forEach(([label, value]) => {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...mediumGray)
    doc.text(label, margin, yPos)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text(value, margin + 60, yPos)
    yPos += 12
  })

  // AI Detection Confidence
  if (evaluation.detectedDomain?.category && evaluation.detectedDomain.category !== 'auto-detect') {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...mediumGray)
    doc.text(`AI Theme Detection: ${evaluation.detectedDomain.confidence}/10 confidence`, margin + 60, yPos)
    yPos += 15
  }

  yPos += 10

  // Detailed Scores
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAILED SCORES', margin, yPos)
  yPos += 20

  const scoreCategories = [
    { name: 'Feasibility', score: evaluation.scores.feasibility, description: 'Technical viability and implementation potential' },
    { name: 'Innovation', score: evaluation.scores.innovation, description: 'Novelty and creative approach' },
    { name: 'Impact', score: evaluation.scores.impact, description: 'Market potential and problem-solving value' },
    { name: 'Clarity', score: evaluation.scores.clarity, description: 'Presentation quality and communication' }
  ]

  scoreCategories.forEach(({ name, score, description }) => {
    // Score bar background
    doc.setFillColor(...lightGray)
    doc.rect(margin, yPos, contentWidth * 0.6, 8, 'F')
    
    // Score bar fill
    const fillWidth = (contentWidth * 0.6) * (score / 10)
    doc.setFillColor(...getRatingColor(score))
    doc.rect(margin, yPos, fillWidth, 8, 'F')

    // Score text
    doc.setTextColor(...darkGray)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(name, margin, yPos - 2)
    
    doc.setTextColor(...getRatingColor(score))
    doc.setFont('helvetica', 'bold')
    doc.text(`${score.toFixed(1)}/10`, margin + contentWidth * 0.65, yPos + 5)

    // Description
    doc.setTextColor(...mediumGray)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(description, margin, yPos + 15)
    
    yPos += 30
  })

  // PAGE 2: JUDGE NOTES & RECOMMENDATIONS
  doc.addPage()
  
  // Header for page 2
  doc.setFillColor(...blue)
  doc.rect(0, 0, pageWidth, 30, 'F')

  doc.setTextColor(...white)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('JUDGE EVALUATION NOTES', margin, 20)

  yPos = 50

  // Project Analysis Section
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PROJECT ANALYSIS', margin, yPos)
  yPos += 15

  // Project Description Section
  doc.setTextColor(...blue)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('WHAT THIS PROJECT IS:', margin, yPos)
  yPos += 15

  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const descriptionLines = doc.splitTextToSize(projectAnalysis.description, contentWidth)
  doc.text(descriptionLines, margin, yPos)
  yPos += descriptionLines.length * 5 + 15

  // Key Features
  doc.setTextColor(...blue)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('KEY FEATURES:', margin, yPos)
  yPos += 12

  projectAnalysis.keyFeatures.forEach(feature => {
    doc.setTextColor(...darkGray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`• ${feature}`, margin, yPos)
    yPos += 10
  })
  yPos += 5

  // WOW Factor
  doc.setTextColor(...blue)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('WOW FACTOR:', margin, yPos)
  yPos += 12

  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const wowLines = doc.splitTextToSize(projectAnalysis.wowFactor, contentWidth)
  doc.text(wowLines, margin, yPos)
  yPos += wowLines.length * 5 + 10

  // USP
  doc.setTextColor(...blue)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('UNIQUE SELLING PROPOSITION:', margin, yPos)
  yPos += 12

  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const uspLines = doc.splitTextToSize(projectAnalysis.usp, contentWidth)
  doc.text(uspLines, margin, yPos)
  yPos += uspLines.length * 5 + 10

  // ROI Potential
  doc.setTextColor(...blue)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('ROI POTENTIAL:', margin, yPos)
  yPos += 12

  doc.setTextColor(...darkGray)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const roiLines = doc.splitTextToSize(projectAnalysis.roiPotential, contentWidth)
  doc.text(roiLines, margin, yPos)
  yPos += roiLines.length * 5 + 10

  // Target Market & Business Model
  const marketBusinessText = `Target Market: ${projectAnalysis.targetMarket} | Business Model: ${projectAnalysis.businessModel}`
  doc.setTextColor(...mediumGray)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  const marketLines = doc.splitTextToSize(marketBusinessText, contentWidth)
  doc.text(marketLines, margin, yPos)
  yPos += marketLines.length * 5 + 15

  // Technical Assessment
  doc.setTextColor(...blue)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TECHNICAL ASSESSMENT:', margin, yPos)
  yPos += 12

  const technicalPoints = [
    `Feasibility Score: ${evaluation.scores.feasibility.toFixed(1)}/10 - ${getRating(evaluation.scores.feasibility)}`,
    `Innovation Level: ${evaluation.scores.innovation.toFixed(1)}/10 - ${getRating(evaluation.scores.innovation)}`,
    `Market Impact: ${evaluation.scores.impact.toFixed(1)}/10 - ${getRating(evaluation.scores.impact)}`,
    `Presentation Quality: ${evaluation.scores.clarity.toFixed(1)}/10 - ${getRating(evaluation.scores.clarity)}`
  ]

  technicalPoints.forEach(point => {
    doc.setTextColor(...darkGray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`• ${point}`, margin, yPos)
    yPos += 12
  })

  yPos += 10

  // Judge Assessment Summary
  doc.setTextColor(...blue)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('JUDGE ASSESSMENT SUMMARY:', margin, yPos)
  yPos += 15

  // Create judge-friendly assessment points
  const assessmentPoints = [
    `Technical Viability: ${getRating(evaluation.scores.feasibility)} (${evaluation.scores.feasibility.toFixed(1)}/10)`,
    `Innovation Factor: ${getRating(evaluation.scores.innovation)} (${evaluation.scores.innovation.toFixed(1)}/10)`,
    `Market Potential: ${getRating(evaluation.scores.impact)} (${evaluation.scores.impact.toFixed(1)}/10)`,
    `Presentation Quality: ${getRating(evaluation.scores.clarity)} (${evaluation.scores.clarity.toFixed(1)}/10)`
  ]

  assessmentPoints.forEach(point => {
    doc.setTextColor(...darkGray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`• ${point}`, margin, yPos)
    yPos += 12
  })

  yPos += 10

  // Recommendation based on overall score
  const recommendation = evaluation.scores.overall >= 7.5 ? 'STRONG CANDIDATE - Recommended for advancement' :
                        evaluation.scores.overall >= 6.0 ? 'VIABLE PROJECT - Consider for advancement' :
                        evaluation.scores.overall >= 4.0 ? 'NEEDS REVIEW - Judge discretion advised' :
                        'BELOW THRESHOLD - Consider for rejection'

  // Check if we have enough space for recommendation section
  const spaceNeeded = 35
  if (yPos + spaceNeeded > pageHeight - 50) {
    doc.addPage()
    
    // Header for new page
    doc.setFillColor(...blue)
    doc.rect(0, 0, pageWidth, 30, 'F')
    doc.setTextColor(...white)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('JUDGE EVALUATION NOTES (CONTINUED)', margin, 20)
    
    yPos = 50
  }

  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F')
  
  doc.setTextColor(...getRatingColor(evaluation.scores.overall))
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  // Split recommendation text if too long
  const recText = `AI RECOMMENDATION: ${recommendation}`
  const recLines = doc.splitTextToSize(recText, contentWidth - 20)
  
  recLines.forEach((line: string, index: number) => {
    doc.text(line, margin + 10, yPos + 13 + (index * 8))
  })
  
  yPos += Math.max(25, recLines.length * 8 + 10)

  // Judge Decision Section - Check if we have enough space
  const remainingSpace = pageHeight - yPos - 40 // Leave space for footer
  
  if (remainingSpace < 80) {
    // Not enough space, add new page
    doc.addPage()
    yPos = 30
  } else {
    yPos += 10
  }

  doc.setFillColor(...lightGray)
  doc.roundedRect(margin, yPos, contentWidth, 60, 5, 5, 'F')

  doc.setTextColor(...darkGray)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('JUDGE DECISION SECTION', margin + 10, yPos + 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('☐ ACCEPT - Recommend for next round/award', margin + 10, yPos + 30)
  doc.text('☐ CONSIDER - Needs further review', margin + 10, yPos + 40)
  doc.text('☐ DECLINE - Does not meet criteria', margin + 10, yPos + 50)

  // Fixed Footer - Always at bottom of page
  const footerY = pageHeight - 15
  doc.setTextColor(...mediumGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Generated by PitchEval AI - Judge Report', margin, footerY)
  
  const pageText = `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()} - ${new Date().toLocaleDateString()}`
  const pageTextWidth = doc.getTextWidth(pageText)
  doc.text(pageText, pageWidth - margin - pageTextWidth, footerY)

  return Buffer.from(doc.output('arraybuffer'))
}