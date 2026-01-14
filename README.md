# PitchEval - AI-Powered Pitch Deck Evaluation Platform

## Overview

PitchEval is an intelligent platform that uses Google's Gemini AI to evaluate startup pitch decks and project presentations. It provides detailed scoring, actionable feedback, and supports both individual evaluations and hackathon-style bulk analysis with custom judging criteria.

## Problem Statement

Evaluating pitch decks manually is time-consuming and subjective. Startups need quick, consistent feedback on their presentations, and hackathon organizers need to efficiently evaluate dozens of submissions with custom criteria. Traditional methods lack scalability and consistency.

## Solution

PitchEval automates pitch deck evaluation using advanced AI, providing:
- Instant, detailed feedback on pitch quality
- Consistent scoring across multiple criteria
- Bulk evaluation for hackathons with custom tracks and weights
- Template compliance validation
- Intelligent caching for faster re-evaluations

## Key Features

### 1. Personal Evaluation
- Upload individual pitch decks (PDF format)
- AI analyzes feasibility, innovation, impact, and clarity
- Receive 7 detailed improvement suggestions
- Download comprehensive PDF reports

### 2. Hackathon Mode
- Bulk upload multiple presentations
- Define custom tracks (AI/ML, Blockchain, Healthcare, etc.)
- Set custom scoring weights per criterion
- Template compliance checking
- Automatic ranking and leaderboard generation
- Export results to Excel

### 3. Intelligent Validation
- AI-powered document type detection
- Rejects invalid documents (marksheets, receipts, certificates)
- Accepts genuine pitch presentations
- Balanced validation approach

### 4. Performance Optimization
- Redis caching for faster evaluations
- RabbitMQ queue system for background processing
- Context-aware cache keys (tracks, weights, templates)
- Handles high-volume submissions efficiently


## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Component library
- **Clerk** - Authentication

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB** - Document database (evaluations, hackathons)
- **Redis** - Caching layer
- **RabbitMQ** - Message queue for async processing

### AI & Processing
- **Google Gemini 2.5 Flash** - AI evaluation engine
- **pdf-parse** - PDF text extraction
- **jsPDF** - Report generation

## System Architecture

```
User Upload → API Route → Queue (RabbitMQ) → Worker Process
                                                    ↓
                                            Cache Check (Redis)
                                                    ↓
                                            Gemini AI Analysis
                                                    ↓
                                            Save to MongoDB
                                                    ↓
                                            Update Cache
                                                    ↓
                                            Return Results
```

### Workflow

1. **Upload**: User uploads PDF via dashboard
2. **Validation**: System checks file type and size
3. **Queue**: Job added to RabbitMQ queue with priority
4. **Cache Check**: System checks Redis for existing evaluation
5. **AI Analysis**: Gemini AI evaluates presentation content
6. **Validation**: AI determines if document is valid pitch deck
7. **Scoring**: AI provides scores (1-10) for 4 criteria
8. **Suggestions**: AI generates 7 actionable improvements
9. **Storage**: Results saved to MongoDB
10. **Cache**: Results cached in Redis for 7 days
11. **Display**: User sees results with download option


## Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB
- Redis instance (local or cloud)
- RabbitMQ instance (CloudAMQP recommended)
- Google Gemini API key
- Clerk account for authentication

### Environment Variables

Create `.env.local` file:

```env
# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_AFTER_SIGN_IN_URL=/dashboard
CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/pitcheval

# Cache & Queue
REDIS_URL=redis://default:password@host:port
RABBITMQ_URL=amqps://user:password@host/vhost

# AI
GEMINI_API_KEY=your_gemini_api_key

# System
NODE_ENV=production
START_QUEUE_WORKER=true
```

## Scoring Criteria

Each presentation is scored 1-10 on:

- **Feasibility** (25%): Technical viability, resources, timeline
- **Innovation** (25%): Novelty, differentiation, IP potential
- **Impact** (25%): Market size, scalability, value creation
- **Clarity** (25%): Presentation quality, structure, storytelling

**Overall Score**: Average of all four criteria

### Scoring Scale
- 1-3: Poor/Severely lacking
- 4-5: Below average/Needs major work
- 6-7: Average/Good with improvements needed
- 8-9: Very good/Strong
- 10: Exceptional/Outstanding

## API Endpoints

### Evaluation
- `POST /api/evaluate/personal` - Submit personal evaluation
- `POST /api/evaluate/hackathon` - Submit hackathon batch
- `GET /api/evaluations/[id]` - Get evaluation results
- `GET /api/evaluations/recent` - Get recent evaluations

### Hackathon
- `GET /api/hackathon/[id]` - Get hackathon details
- `GET /api/hackathon/[id]/export` - Export to Excel

### Reports
- `GET /api/reports/[id]` - Download PDF report
- `GET /api/judge-reports/[id]` - Download judge report

### System
- `GET /api/health` - Basic health check
- `GET /api/health/full` - Detailed system status
- `POST /api/queue/trigger` - Trigger queue processing

## Project Structure

```
pitcheval/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── evaluate/         # Evaluation endpoints
│   │   ├── hackathon/        # Hackathon endpoints
│   │   ├── reports/          # Report generation
│   │   └── queue/            # Queue management
│   ├── dashboard/            # Dashboard pages
│   └── landing/              # Landing page
├── components/               # React components
│   ├── dashboard/            # Dashboard components
│   ├── landing/              # Landing components
│   └── ui/                   # Reusable UI components
├── lib/                      # Core logic
│   ├── ai/                   # AI integration
│   │   ├── gemini.ts         # Gemini API client
│   │   ├── templateAnalysis.ts
│   │   └── validationEngine.ts
│   ├── models/               # MongoDB schemas
│   ├── processors/           # Job processors
│   ├── workers/              # Queue workers
│   ├── cache.ts              # Redis caching
│   ├── queue.ts              # RabbitMQ client
│   └── mongodb.ts            # Database connection
├── scripts/                  # Utility scripts
├── types/                    # TypeScript types
└── public/                   # Static assets
```
**Built with ❤️ using Next.js, Gemini AI, and modern web technologies**
