'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import SimpleLoader from '@/components/ui/SimpleLoader'
import Dashboard from '@/components/dashboard/Dashboard'

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <SimpleLoader message="Loading..." />
  }

  if (!isSignedIn) {
    return <SimpleLoader message="Redirecting..." />
  }

  return <Dashboard />
}