import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import ErrorBoundary from '@/components/ErrorBoundary'
import '@/lib/console-filter'
import '@/lib/startup' // Initialize services on app start
import './globals.css'

export const metadata: Metadata = {
  title: 'PitchEval - AI-Powered Pitch Evaluation Platform',
  description: 'Evaluate hackathon submissions and pitch presentations with AI-powered analysis. Get instant feedback, detailed scoring, and improvement suggestions.',
  keywords: 'pitch evaluation, hackathon, AI analysis, presentation feedback, startup evaluation',
  authors: [{ name: 'PitchEval Team' }],
  creator: 'PitchEval',
  publisher: 'PitchEval',

  openGraph: {
    title: 'PitchEval - AI-Powered Pitch Evaluation',
    description: 'Get brutal honest AI feedback on your pitch presentations. No bias, no politics, just results.',
    url: 'https://pitcheval.com',
    siteName: 'PitchEval',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PitchEval - AI-Powered Pitch Evaluation',
    description: 'Get brutal honest AI feedback on your pitch presentations.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#FF6B35',
        },
      }}
    >
      <html lang="en">
        <body className="font-sans antialiased">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  )
}