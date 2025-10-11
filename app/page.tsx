import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'

export default async function Home() {
  const { userId } = await auth()
  
  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect('/dashboard')
  }
  
  // Otherwise show landing page
  return <LandingPage />
}