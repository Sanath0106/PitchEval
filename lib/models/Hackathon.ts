import mongoose from 'mongoose'

const HackathonSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  tracks: [String],
  weights: {
    innovation: {
      type: Number,
      min: 0,
      max: 100,
      default: 25,
    },
    feasibility: {
      type: Number,
      min: 0,
      max: 100,
      default: 25,
    },
    impact: {
      type: Number,
      min: 0,
      max: 100,
      default: 25,
    },
    clarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 25,
    },
  },
  additionalInfo: String,
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  evaluations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evaluation',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Hackathon || mongoose.model('Hackathon', HackathonSchema)