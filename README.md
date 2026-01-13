# PitchEval

AI-powered presentation evaluation platform for hackathons, pitch competitions, and individual feedback.

## Problem Statement

Manual evaluation of presentations creates significant challenges for event organizers and participants:

- Event organizers spend hours reviewing hundreds of submissions manually
- Human judges apply inconsistent criteria and introduce personal biases
- Participants receive delayed, generic feedback that lacks actionable insights
- Scaling evaluation for large competitions becomes logistically impossible
- Cost of hiring qualified judges increases exponentially with submission volume

## Solution

PitchEval automates presentation evaluation using Google Gemini 2.0 Flash AI, providing instant, unbiased analysis with consistent scoring criteria. The platform serves two primary use cases: individual presentation analysis for immediate feedback and bulk evaluation for hackathons and competitions.

## How It Works

### Core Evaluation Process

The system evaluates presentations across four key dimensions:

**Feasibility**: Technical viability, resource requirements, and implementation realism<br>
**Innovation**: Originality, differentiation, and technological advancement<br>
**Impact**: Market potential, user adoption, and social/economic value<br>
**Clarity**: Presentation quality, structure, visual design, and storytelling

### System Architecture

**Frontend Layer**
- Next.js 16 with TypeScript for the web application
- Tailwind CSS for responsive UI design
- Clerk Authentication for secure user management
- React components for interactive file uploads and results display

**Backend Services**
- Next.js API Routes handling HTTP requests and file processing
- MongoDB for persistent data storage of evaluations and user data
- Google Gemini 2.0 Flash AI model for intelligent presentation analysis
- Redis Cloud for high-performance caching and duplicate detection
- CloudAMQP (RabbitMQ) for reliable message queuing and bulk processing

## Workflows

### Single File Evaluation
1. User uploads PDF file via web interface
2. System generates SHA-256 hash for cache lookup
3. If cached, returns instant results; if not, queues for AI processing
4. Gemini AI analyzes file with domain-specific context
5. Results cached in Redis and stored in MongoDB
6. Detailed feedback displayed to user

### Bulk Evaluation for Hackathons
1. Multiple files uploaded with selected evaluation template
2. Each file queued with priority ordering for parallel processing
3. AI evaluates against structured template criteria
4. Duplicate files served from cache for efficiency
5. Weighted scores computed for ranking and leaderboard generation
6. Comprehensive results and rankings exported for organizers

### Environment Configuration

Copy the example environment file and configure required variables:

```bash
cp .env.example
```

Required environment variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_url
RABBITMQ_URL=your_rabbitmq_connection_url
GEMINI_API_KEY=your_google_gemini_api_key
```

### Installation Steps

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables as shown above
4. Run development server: `npm run dev`
5. Access application at `http://localhost:3000`

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint code analysis
npm run type-check   # TypeScript type checking
npm run cleanup      # Clean up database records
```

## Project Structure

```
app/                 # Next.js application directory
├── api/            # API route handlers
├── dashboard/      # Dashboard interface pages
└── landing/        # Landing page components

components/         # React component library
├── ui/            # Reusable UI components
├── dashboard/     # Dashboard-specific components
└── landing/       # Landing page components

lib/               # Core utility libraries
├── ai/           # AI integration and processing
├── models/       # Database schema definitions
├── processors/   # Background job processors
└── workers/      # Queue worker implementations

types/            # TypeScript type definitions
scripts/          # Utility and maintenance scripts
```

This architecture provides a robust, scalable foundation for AI-powered presentation evaluation while maintaining high performance, reliability, and cost efficiency through intelligent caching and queuing technologies.