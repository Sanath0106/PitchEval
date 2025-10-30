'use client'

import { UserButton } from '@clerk/nextjs'
import Logo from './Logo'

interface AppHeaderProps {
  variant?: 'landing' | 'dashboard'
  className?: string
}

export default function AppHeader({ variant = 'dashboard', className = '' }: AppHeaderProps) {
  const baseClasses = "relative z-10 backdrop-blur-xl border-b transition-all duration-300"
  
  const variantClasses = {
    landing: "fixed top-0 w-full bg-black/95 border-gray-800/50 shadow-2xl shadow-black/20",
    dashboard: "bg-gray-900/80 border-gray-700/50 shadow-lg shadow-black/10"
  }

  return (
    <header className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        {variant === 'dashboard' && <UserButton />}
      </div>
    </header>
  )
}