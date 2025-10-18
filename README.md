# 🚀 PitchEval

**AI-Powered Pitch Evaluation Platform** for startups, hackathons, and presentations. Get intelligent feedback, automated scoring, and professional reports powered by Google Gemini AI.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎯 Personal Evaluation
- **PDF Upload & Analysis**: Upload presentation PDFs for instant AI evaluation
- **Comprehensive Scoring**: Get scores across 4 key criteria (Feasibility, Innovation, Impact, Clarity)
- **AI-Powered Suggestions**: Receive detailed improvement recommendations
- **Professional Reports**: Download beautifully formatted evaluation reports
- **Invalid File Detection**: Automatically rejects non-presentation files (resumes, IDs, etc.)

### 🏆 Hackathon Management
- **Bulk Evaluation**: Process multiple submissions simultaneously
- **Automated Ranking**: Real-time leaderboards with weighted scoring
- **Track-Based Filtering**: AI validates submissions against hackathon tracks
- **Template Compliance**: Ensure submissions follow provided templates
- **CSV Export**: Export results with essential columns only
- **Team Management**: Handle multiple participants and submissions

### 🤖 Smart AI Analysis
- **Google Gemini 2.0 Flash**: Latest AI model for accurate evaluation
- **Context-Aware Scoring**: Domain-specific evaluation criteria
- **Track Relevance Detection**: Automatically matches submissions to tracks
- **Template Validation**: Checks structure and theme compliance
- **Intelligent Fallbacks**: Graceful handling of processing failures

### 🎨 Beautiful User Experience
- **Modern Dark UI**: Sleek, professional interface with orange accents
- **Animated Backgrounds**: Dynamic gradients and floating particles
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Processing**: Live progress tracking with animated loaders
- **Intuitive Navigation**: Clean, user-friendly interface

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.5.4
- **Styling**: Tailwind CSS with custom animations
- **Components**: Radix UI primitives
- **Icons**: Lucide React icons
- **State Management**: React hooks and context

### Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk (secure, scalable auth)
- **File Processing**: PDF parsing and generation
- **Queue System**: RabbitMQ for background processing
- **Caching**: Redis for performance optimization

### AI & Processing
- **AI Model**: Google Gemini 2.0 Flash
- **File Support**: PDF presentations
- **Processing**: Async queue-based evaluation
- **Validation**: Multi-layer file type detection
- **Scoring**: Weighted criteria-based evaluation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google Gemini API key
- Clerk account for authentication

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/pitcheval.git
cd pitcheval
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/pitcheval
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/pitcheval

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Processing
GEMINI_API_KEY=your_google_gemini_api_key

# Optional: Queue System (RabbitMQ)
RABBITMQ_URL=amqp://localhost:5672

# Optional: Caching (Redis)
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# The app will automatically create collections on first run
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
pitcheval/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── evaluate/             # Evaluation endpoints
│   │   ├── hackathon/            # Hackathon management
│   │   └── templates/            # Template analysis
│   ├── dashboard/                # Dashboard pages
│   └── (auth)/                   # Authentication pages
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   ├── landing/                  # Landing page components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── ai/                       # AI processing logic
│   ├── models/                   # Database models
│   ├── processors/               # Background processors
│   └── workers/                  # Queue workers
└── public/                       # Static assets
```

## 🔧 Configuration

### Scoring Weights
Customize evaluation criteria weights in hackathon settings:
```typescript
{
  innovation: 30,    // 30%
  feasibility: 25,   // 25%
  impact: 25,        // 25%
  clarity: 20        // 20%
}
```

### AI Prompts
AI evaluation prompts are configurable in `lib/ai/gemini.ts`:
- File type validation
- Scoring criteria
- Track relevance checking
- Template compliance

### Queue System
Background processing with RabbitMQ (optional):
- Personal evaluations: High priority (8)
- Hackathon evaluations: Medium priority (5)
- Bulk processing: Low priority (3)

## 📊 API Endpoints

### Personal Evaluation
```bash
POST /api/evaluate/personal
# Upload and evaluate a single presentation

GET /api/evaluations/[id]
# Get evaluation results

GET /api/evaluations/recent
# Get user's recent evaluations
```

### Hackathon Management
```bash
POST /api/hackathon
# Create new hackathon

POST /api/evaluate/hackathon
# Submit to hackathon

GET /api/hackathon/[id]
# Get hackathon details and rankings

GET /api/hackathon/[id]/export
# Export results as CSV
```

### Template Analysis
```bash
POST /api/templates/analyze
# Analyze template structure and theme
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

3. **Environment Variables**:
   Add all `.env.local` variables to Vercel dashboard

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **File Type Validation**: Multi-layer detection of invalid files
- **Authentication**: Secure Clerk-based auth with session management
- **Input Sanitization**: All user inputs are validated and sanitized
- **Rate Limiting**: API endpoints protected against abuse
- **Error Handling**: Graceful error handling without data leaks

## 🎯 Usage Examples

### Personal Evaluation
1. Sign up/login with Clerk
2. Upload a PDF presentation
3. Select project domain/track
4. Get AI evaluation with scores and suggestions
5. Download professional report

### Hackathon Management
1. Create hackathon with tracks and weights
2. Share submission link with participants
3. Monitor submissions in real-time
4. View automated rankings and analytics
5. Export results as CSV

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Test thoroughly before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful evaluation capabilities
- **Clerk** for seamless authentication
- **Vercel** for excellent deployment platform
- **MongoDB** for reliable data storage
- **Tailwind CSS** for beautiful styling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pitcheval/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pitcheval/discussions)
- **Email**: support@pitcheval.com

---

**Made with ❤️ for the startup and hackathon community**