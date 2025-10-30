import jsPDF from 'jspdf'

interface EvaluationData {
  fileName: string
  domain: string
  detectedDomain?: {
    category: string
    confidence: number
    reason: string
  }
  scores: {
    feasibility: number
    innovation: number
    impact: number
    clarity: number
    overall: number
  }
  suggestions: string[]
  createdAt: Date
}

export async function generatePDFReport(evaluation: EvaluationData): Promise<Buffer> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Professional color scheme
  const orange = [255, 107, 53] as [number, number, number]
  const darkGray = [45, 45, 45] as [number, number, number]
  const mediumGray = [120, 120, 120] as [number, number, number]
  const lightGray = [240, 240, 240] as [number, number, number]
  const white = [255, 255, 255] as [number, number, number]

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

  const addPageHeader = (pageNum: number, title: string) => {
    // Orange header bar
    doc.setFillColor(...orange)
    doc.rect(0, 0, pageWidth, 25, 'F')

    // Header text
    doc.setTextColor(...white)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PITCHEVAL REPORT', margin, 16)

    doc.setFontSize(10)
    doc.text(`Page ${pageNum} of 3`, pageWidth - margin - 25, 16)

    // Page title
    doc.setTextColor(...darkGray)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, 45)

    // Underline
    doc.setDrawColor(...orange)
    doc.setLineWidth(2)
    doc.line(margin, 48, margin + 80, 48)
  }

  // PAGE 1: OVERVIEW & SCORES
  addPageHeader(1, 'EVALUATION OVERVIEW')

  let yPos = 65

  // Overall Score Card
  doc.setFillColor(...lightGray)
  doc.rect(margin, yPos, contentWidth, 50, 'F')
  doc.setDrawColor(...mediumGray)
  doc.setLineWidth(1)
  doc.rect(margin, yPos, contentWidth, 50)

  // Large score circle
  doc.setFillColor(...orange)
  doc.circle(margin + 40, yPos + 25, 20, 'F')

  doc.setTextColor(...white)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  const scoreText = evaluation.scores.overall.toFixed(1)
  doc.text(scoreText, margin + 32, yPos + 30)

  // Rating text
  doc.setTextColor(...darkGray)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(getRating(evaluation.scores.overall), margin + 80, yPos + 20)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...mediumGray)
  doc.text('Overall Performance Rating', margin + 80, yPos + 35)

  yPos += 65

  // Presentation Details
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESENTATION DETAILS', margin, yPos)
  yPos += 15

  // Get the display domain - use AI detected if available, otherwise fallback
  const displayDomain = evaluation.detectedDomain?.category && evaluation.detectedDomain.category !== 'auto-detect' 
    ? evaluation.detectedDomain.category 
    : (evaluation.domain === 'auto-detect' ? 'Multi-Domain Project' : evaluation.domain)

  const details = [
    ['File Name:', evaluation.fileName],
    ['Project Theme:', displayDomain.toUpperCase()],
    ['Analysis Date:', new Date(evaluation.createdAt).toLocaleDateString('en-US', {
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
    doc.text(value, margin + 50, yPos)
    yPos += 12
  })

  // Add AI detection confidence if available
  if (evaluation.detectedDomain?.category && evaluation.detectedDomain.category !== 'auto-detect') {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...mediumGray)
    doc.text(`AI Detected with ${evaluation.detectedDomain.confidence}/10 confidence`, margin + 50, yPos)
    yPos += 8
  }

  yPos += 10

  // Score Breakdown
  doc.setTextColor(...darkGray)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAILED SCORES', margin, yPos)
  yPos += 15

  const scores = [
    ['Innovation', evaluation.scores.innovation],
    ['Feasibility', evaluation.scores.feasibility],
    ['Impact', evaluation.scores.impact],
    ['Clarity', evaluation.scores.clarity]
  ]

  scores.forEach(([name, score]) => {
    // Score name
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)
    doc.text(name as string, margin, yPos)

    // Progress bar background
    const barWidth = 100
    doc.setFillColor(...lightGray)
    doc.rect(margin + 50, yPos - 4, barWidth, 8, 'F')

    // Progress bar fill
    const fillWidth = ((score as number) / 10) * barWidth
    doc.setFillColor(...orange)
    doc.rect(margin + 50, yPos - 4, fillWidth, 8, 'F')

    // Score value
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...orange)
    doc.text(`${(score as number).toFixed(1)}/10`, margin + 160, yPos)

    yPos += 18
  })

  // Footer
  doc.setTextColor(...mediumGray)
  doc.setFontSize(9)
  doc.text('Generated by PitchEval • https://pitcheval.vercel.app', margin, pageHeight - 15)

  // PAGE 2: RECOMMENDATIONS 1-4
  doc.addPage()
  addPageHeader(2, 'KEY RECOMMENDATIONS')

  yPos = 65
  const firstFour = evaluation.suggestions.slice(0, 4)

  firstFour.forEach((suggestion, index) => {
    // Recommendation card
    doc.setFillColor(...lightGray)
    const lines = doc.splitTextToSize(suggestion, contentWidth - 50)
    const cardHeight = Math.max(25, (lines.length * 4.2) + 12)

    doc.rect(margin, yPos, contentWidth, cardHeight, 'F')
    doc.setDrawColor(...mediumGray)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPos, contentWidth, cardHeight)

    // Number badge
    doc.setFillColor(...orange)
    doc.circle(margin + 15, yPos + 12, 8, 'F')

    doc.setTextColor(...white)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}`, margin + 12, yPos + 15)

    // Recommendation text - properly formatted
    doc.setTextColor(...darkGray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    lines.forEach((line: string, lineIndex: number) => {
      doc.text(line.trim(), margin + 30, yPos + 10 + (lineIndex * 4.2))
    })

    yPos += cardHeight + 8
  })

  // Footer
  doc.setTextColor(...mediumGray)
  doc.setFontSize(9)
  doc.text('Generated by PitchEval • https://pitcheval.vercel.app', margin, pageHeight - 15)

  // PAGE 3: RECOMMENDATIONS 5-7
  doc.addPage()
  addPageHeader(3, 'ADDITIONAL RECOMMENDATIONS')

  yPos = 65
  const remaining = evaluation.suggestions.slice(4, 7)

  remaining.forEach((suggestion, index) => {
    // Recommendation card
    doc.setFillColor(...lightGray)
    const lines = doc.splitTextToSize(suggestion, contentWidth - 50)
    const cardHeight = Math.max(25, (lines.length * 4.2) + 12)

    doc.rect(margin, yPos, contentWidth, cardHeight, 'F')
    doc.setDrawColor(...mediumGray)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPos, contentWidth, cardHeight)

    // Number badge
    doc.setFillColor(...orange)
    doc.circle(margin + 15, yPos + 12, 8, 'F')

    doc.setTextColor(...white)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 5}`, margin + 12, yPos + 15)

    // Recommendation text - properly formatted
    doc.setTextColor(...darkGray)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    lines.forEach((line: string, lineIndex: number) => {
      doc.text(line.trim(), margin + 30, yPos + 10 + (lineIndex * 4.2))
    })

    yPos += cardHeight + 8
  })

  // Final footer
  doc.setTextColor(...mediumGray)
  doc.setFontSize(9)
  doc.text('Generated by PitchEval • https://pitcheval.vercel.app', margin, pageHeight - 15)
  doc.text('© 2025 PitchEval. Professional AI-Powered Pitch Analysis.', margin, pageHeight - 8)

  return Buffer.from(doc.output('arraybuffer'))
}