# PitchEval

AI-powered pitch evaluation platform for startups and hackathons. Get intelligent feedback, improve presentations, and manage competitions with automated scoring.

## Features

- **Personal Evaluation**: Upload PDFs, get AI feedback, download professional reports
- **Hackathon Management**: Bulk evaluation, automated ranking, team reports, CSV export
- **Smart Analysis**: Google Gemini AI with track-based filtering
- **Beautiful UI**: Animated backgrounds, responsive design, dark themes

## Tech Stack

- **Framework**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **Auth**: Clerk authentication
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **File Processing**: PDF parsing and generation

## Quick Start

1. **Clone and install**:
```bash
git clone <repo-url>
cd pitcheval
npm install
```

2. **Environment setup**:
```env
# .env.local
MONGODB_URI=your_mongodb_uri
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
GEMINI_API_KEY=your_gemini_key
```

3. **Run development**:
```bash
npm run dev
```

## Deployment

**Vercel** (recommended):
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

**Manual**:
```bash
npm run build
npm start
```

## License

MIT License