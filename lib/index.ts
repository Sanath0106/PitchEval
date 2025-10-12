// Re-export all lib modules for easier importing
export { default as dbConnect } from './mongodb'
export { default as Evaluation } from './models/Evaluation'
export { default as Hackathon } from './models/Hackathon'
export { evaluatePresentationFile } from './ai/gemini'
export { generatePDFReport } from './reportGenerator'