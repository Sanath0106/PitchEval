'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl shadow-black/20">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Logo variant="compact" />
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a 
            href="#benefits" 
            className="text-gray-300 hover:text-orange-400 transition-all duration-300 font-medium cursor-pointer relative group"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="#process" 
            className="text-gray-300 hover:text-orange-400 transition-all duration-300 font-medium cursor-pointer relative group"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a 
            href="#faq" 
            className="text-gray-300 hover:text-orange-400 transition-all duration-300 font-medium cursor-pointer relative group"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            FAQ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        {/* CTA Button */}
        <SignInButton mode="modal">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 border border-orange-400/20"
          >
            Get Started
          </Button>
        </SignInButton>
      </div>
    </header>
  )
}