'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-xl border-b border-gray-800/50 card-glow">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Logo />
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#benefits" 
            className="text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Features
          </a>
          <a 
            href="#process" 
            className="text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How it Works
          </a>
          <a 
            href="#faq" 
            className="text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            FAQ
          </a>
        </nav>

        {/* CTA Button */}
        <SignInButton mode="modal">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 card-glow"
          >
            Get Started
          </Button>
        </SignInButton>
      </div>
    </header>
  )
}