import jsPDF from 'jspdf'

interface EvaluationData {
  fileName: string
  domain: string
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
  
  // Set Times New Roman as default font
  doc.setFont('times', 'normal')
  
  // Colors
  const orangeColor: [number, number, number] = [255, 107, 53]
  const darkGray: [number, number, number] = [64, 64, 64]
  const lightGray: [number, number, number] = [128, 128, 128]
  const black: [number, number, number] = [0, 0, 0]
  const white: [number, number, number] = [255, 255, 255]
  
  // PAGE 1: SCORES AND OVERVIEW
  
  // Main border around entire page
  doc.setDrawColor(...black)
  doc.setLineWidth(1)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
  
  // Header background
  doc.setFillColor(248, 249, 250)
  doc.rect(15, 15, pageWidth - 30, 40, 'F')
  
  // Header border
  doc.setDrawColor(...black)
  doc.setLineWidth(1)
  doc.rect(15, 15, pageWidth - 30, 40)
  
  // Logo area
  doc.setFillColor(...orangeColor)
  doc.circle(25, 35, 8, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(14)
  doc.text('P', 22, 39)
  
  // Title
  doc.setTextColor(...orangeColor)
  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  doc.text('PitchEval Report', 40, 39)
  
  // Subtitle
  doc.setTextColor(...darkGray)
  doc.setFont('times', 'italic')
  doc.setFontSize(12)
  doc.text('AI-Powered Presentation Analysis', 40, 48)
  
  // File Information Section
  doc.setFillColor(248, 249, 250)
  doc.rect(20, 65, pageWidth - 40, 35, 'F')
  doc.setDrawColor(...black)
  doc.setLineWidth(0.5)
  doc.rect(20, 65, pageWidth - 40, 35)
  
  doc.setTextColor(...black)
  doc.setFont('times', 'bold')
  doc.setFontSize(14)
  doc.text('File Information', 25, 75)
  
  doc.setFont('times', 'normal')
  doc.setFontSize(11)
  doc.text(`File Name: ${evaluation.fileName}`, 25, 85)
  doc.text(`Domain: ${evaluation.domain}`, 25, 92)
  doc.text(`Evaluated: ${new Date(evaluation.createdAt).toLocaleDateString()}`, 25, 99)
  
  // Overall Score Section
  doc.setFillColor(250, 250, 250)
  doc.rect(20, 110, pageWidth - 40, 50, 'F')
  doc.setDrawColor(...black)
  doc.setLineWidth(1)
  doc.rect(20, 110, pageWidth - 40, 50)
  
  doc.setTextColor(...orangeColor)
  doc.setFont('times', 'bold')
  doc.setFontSize(16)
  doc.text('Overall Score', 25, 125)
  
  doc.setFont('times', 'bold')
  doc.setFontSize(36)
  doc.text(`${evaluation.scores.overall.toFixed(1)}`, 25, 145)
  doc.setFontSize(18)
  doc.text('/10', 55, 145)
  
  // Score interpretation
  doc.setFont('times', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(...darkGray)
  const scoreText = evaluation.scores.overall >= 8 ? 'Excellent' : 
                   evaluation.scores.overall >= 7 ? 'Good' :
                   evaluation.scores.overall >= 6 ? 'Average' :
                   evaluation.scores.overall >= 5 ? 'Below Average' : 'Needs Improvement'
  doc.text(`Performance: ${scoreText}`, 25, 155)
  
  // Detailed Scores Section
  doc.setTextColor(...black)
  doc.setFont('times', 'bold')
  doc.setFontSize(16)
  doc.text('Detailed Breakdown', 20, 180)
  
  const scores = [
    { name: 'Feasibility', score: evaluation.scores.feasibility },
    { name: 'Innovation', score: evaluation.scores.innovation },
    { name: 'Impact', score: evaluation.scores.impact },
    { name: 'Clarity', score: evaluation.scores.clarity },
  ]
  
  let yPos = 195
  scores.forEach(({ name, score }) => {
    // Simple score box with black border
    doc.setDrawColor(...black)
    doc.setFillColor(240, 240, 240)
    doc.rect(20, yPos - 8, 15, 12, 'FD')
    
    doc.setTextColor(...black)
    doc.setFont('times', 'bold')
    doc.setFontSize(10)
    doc.text(score.toFixed(1), 22, yPos - 1)
    
    // Score details
    doc.setTextColor(...black)
    doc.setFont('times', 'normal')
    doc.setFontSize(12)
    doc.text(`${name}`, 40, yPos)
    
    // Simple progress bar with black border
    doc.setDrawColor(...black)
    doc.setFillColor(240, 240, 240)
    doc.rect(120, yPos - 6, 60, 4, 'FD')
    
    // Progress bar fill - simple gray
    doc.setFillColor(100, 100, 100)
    doc.rect(120, yPos - 6, (score / 10) * 60, 4, 'F')
    
    yPos += 20
  })
  
  // Footer for page 1
  doc.setDrawColor(...black)
  doc.setLineWidth(0.5)
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25)
  doc.setTextColor(...lightGray)
  doc.setFont('times', 'normal')
  doc.setFontSize(8)
  doc.text('PitchEval website - Confidential Report', 20, pageHeight - 15)
  doc.text('Page 1 of 2', pageWidth - 35, pageHeight - 15)
  
  // PAGE 2: SUGGESTIONS
  doc.addPage()
  
  // Main border around entire page
  doc.setDrawColor(...black)
  doc.setLineWidth(1)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
  
  // Header background
  doc.setFillColor(248, 249, 250)
  doc.rect(15, 15, pageWidth - 30, 35, 'F')
  
  // Header border
  doc.setDrawColor(...black)
  doc.setLineWidth(1)
  doc.rect(15, 15, pageWidth - 30, 35)
  
  doc.setTextColor(...orangeColor)
  doc.setFont('times', 'bold')
  doc.setFontSize(20)
  doc.text('Improvement Suggestions', 20, 35)
  
  doc.setTextColor(...darkGray)
  doc.setFont('times', 'italic')
  doc.setFontSize(11)
  doc.text('AI-generated recommendations to enhance your presentation', 20, 45)
  
  // Suggestions
  yPos = 65
  evaluation.suggestions.forEach((suggestion, index) => {
    if (yPos > pageHeight - 60) {
      // Add new page if needed
      doc.addPage()
      yPos = 30
    }
    
    // Calculate required height for full text
    const lines = doc.splitTextToSize(suggestion, pageWidth - 80)
    const requiredHeight = Math.max(25, lines.length * 4 + 15)
    
    // Simple suggestion box with black border
    doc.setFillColor(250, 250, 250)
    doc.rect(20, yPos - 5, pageWidth - 40, requiredHeight, 'F')
    
    // Black border
    doc.setDrawColor(...black)
    doc.setLineWidth(1)
    doc.rect(20, yPos - 5, pageWidth - 40, requiredHeight)
    
    // Simple number circle
    doc.setDrawColor(...black)
    doc.setFillColor(240, 240, 240)
    doc.circle(30, yPos + 8, 6, 'FD')
    doc.setTextColor(...black)
    doc.setFont('times', 'bold')
    doc.setFontSize(10)
    doc.text(`${index + 1}`, 27, yPos + 11)
    
    // Full suggestion text - no cutting off
    doc.setTextColor(...black)
    doc.setFont('times', 'normal')
    doc.setFontSize(9)
    doc.text(lines, 45, yPos + 5) // Include ALL lines
    
    yPos += requiredHeight + 8
  })
  
  // Footer for page 2
  doc.setDrawColor(...black)
  doc.setLineWidth(0.5)
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25)
  doc.setTextColor(...lightGray)
  doc.setFont('times', 'normal')
  doc.setFontSize(8)
  doc.text('Generated by PitchEval AI - For more insights visit PitchEval website', 20, pageHeight - 15)
  doc.text('Page 2 of 2', pageWidth - 35, pageHeight - 15)
  
  return Buffer.from(doc.output('arraybuffer'))
}