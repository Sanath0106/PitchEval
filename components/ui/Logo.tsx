'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface LogoProps {
  className?: string
  iconSize?: string
  textSize?: string
}

export default function Logo({ 
  className = "flex items-center space-x-3", 
  iconSize = "w-10 h-10",
  textSize = "text-2xl"
}: LogoProps) {
  const { isSignedIn } = useUser()
  const router = useRouter()

  const handleLogoClick = () => {
    if (isSignedIn) {
      router.push('/dashboard')
    } else {
      router.push('/landing')
    }
  }

  return (
    <div 
      className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={handleLogoClick}
    >
      <div className={`${iconSize} bg-orange-500 rounded-full flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">P</span>
      </div>
      <span className={`${textSize} font-semibold text-white`}>PitchEval</span>
    </div>
  )
}