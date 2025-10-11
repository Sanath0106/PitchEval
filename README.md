# PitchEval - AI-Powered Pitch Evaluation Platform

PitchEval is an AI-powered platform designed to evaluate PDF presentations used in hackathons and pitch competitions. It provides fair, unbiased, and instant feedback for both individual participants and hackathon organizers.

## Features

### 🎯 Two Evaluation Modes
- **Personal Mode**: Individual pitch evaluation with detailed feedback
- **Hackathon Mode**: Bulk evaluation and ranking for events (up to 20 submissions)

### 🤖 AI-Powered Analysis
- Evaluates presentations on 4 key criteria:
  - **Feasibility**: How realistic and achievable is the project?
  - **Innovation**: How novel and creative is the solution?
  - **Impact**: What is the potential positive impact?
  - **Clarity**: How clear and well-structured is the presentation?

### 📊 Comprehensive Reporting
- Detailed scoring (1-10 scale for each criterion)
- 5 actionable improvement suggestions
- Downloadable PDF reports
- Excel export for hackathon results

### ⚡ Advanced Features
- Parallel processing with queue system
- Weighted scoring for hackathon events
- Real-time evaluation status
- Secure file handling
- Email notifications (coming soon)

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: ShadCN UI, Tailwind CSS
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **File Processing**: PDF-Parse, Mammoth
- **Queue System**: BullMQ with Redis
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Redis server
- Google Gemini API key
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pitcheval.git
cd pitcheval
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/pitcheval

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Redis (for BullMQ)
REDIS_URL=redis://localhost:6379
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
pitcheval/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── landing/          # Landing page components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility libraries
│   ├── models/           # MongoDB models
│   ├── ai/              # AI integration
│   └── utils.ts         # Helper functions
└── middleware.ts         # Clerk middleware
```

## API Endpoints

### Personal Evaluation
- `POST /api/evaluate/personal` - Upload and evaluate single presentation

### Hackathon Evaluation  
- `POST /api/evaluate/hackathon` - Upload and evaluate multiple presentations

### Reports
- `GET /api/reports/[id]` - Download evaluation report

## Usage

### Personal Mode
1. Sign up/Login with Clerk
2. Navigate to Personal Upload
3. Upload your PDF file
4. Select project domain
5. Get instant AI evaluation with scores and suggestions
6. Download detailed PDF report

### Hackathon Mode
1. Create hackathon event
2. Set evaluation weights for each criterion
3. Upload up to 20 presentation files
4. Get ranked results with detailed scoring
5. Export results to Excel
6. Download individual team reports

## Evaluation Criteria

Each presentation is evaluated on a 1-10 scale across four dimensions:

- **Feasibility (25%)**: Technical viability, resource requirements, implementation complexity
- **Innovation (25%)**: Novelty, creativity, unique approach to problem-solving  
- **Impact (25%)**: Potential benefits, target audience reach, societal value
- **Clarity (25%)**: Presentation structure, communication effectiveness, visual design

Weights can be customized in Hackathon Mode to match specific event requirements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@pitcheval.com or join our Discord community.

## Roadmap

- [ ] Email notifications for evaluation completion
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Integration with popular hackathon platforms
- [ ] Mobile app for judges
- [ ] Real-time evaluation streaming
- [ ] Custom evaluation templates
- [ ] Multi-language support

---

Built with ❤️ for the hackathon community