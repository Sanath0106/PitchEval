'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface LogoProps {
  className?: string
  iconSize?: string
  textSize?: string
  variant?: 'default' | 'compact'
}

export default function Logo({
  className = "flex items-center space-x-3",
  iconSize = "w-10 h-10",
  textSize = "text-2xl",
  variant = 'default'
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
      className={`${className} cursor-pointer group transition-all duration-300 hover:scale-105`}
      onClick={handleLogoClick}
    >
      <div className={`${iconSize} bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300`}>
        <span className="text-white font-bold text-lg">P</span>
      </div>
      <div className="flex flex-col">
        <span className={`${textSize} font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent`}>
          PitchEval
        </span>
        {variant === 'default' && (
          <span className="text-xs text-gray-400 -mt-1 font-medium">
            AI-Powered Evaluation
          </span>
        )}
      </div>
    </div>
  )
}