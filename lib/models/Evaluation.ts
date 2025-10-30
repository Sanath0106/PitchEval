import mongoose from 'mongoose'

const EvaluationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['personal', 'hackathon'],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  description: String,
  scores: {
    feasibility: {
      type: Number,
      min: 0,
      max: 10,
    },
    innovation: {
      type: Number,
      min: 0,
      max: 10,
    },
    impact: {
      type: Number,
      min: 0,
      max: 10,
    },
    clarity: {
      type: Number,
      min: 0,
      max: 10,
    },
    overall: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  suggestions: [String],
  detectedDomain: {
    category: String,
    confidence: {
      type: Number,
      min: 1,
      max: 10,
    },
    reason: String,
  },
  trackRelevance: {
    isRelevant: {
      type: Boolean,
      default: true,
    },
    matchedTracks: [String],
    relevanceScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    reason: String,
  },
  templateValidation: {
    themeMatch: {
      score: {
        type: Number,
        min: 0,
        max: 10,
      },
      reasoning: String,
    },
    structureAdherence: {
      score: {
        type: Number,
        min: 0,
        max: 10,
      },
      deviations: [String],
    },
    overallCompliance: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
  },
  hackathonId: String,
  rank: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Evaluation || mongoose.model('Evaluation', EvaluationSchema)