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
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
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