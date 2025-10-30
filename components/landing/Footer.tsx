import Logo from '@/components/ui/Logo'

export default function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-gray-800/50 bg-gradient-to-b from-black/80 to-black relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo */}
          <Logo variant="compact" className="flex items-center space-x-3 mb-6 md:mb-0" />
          
          {/* Footer Links */}
          <div className="flex items-center space-x-8 text-sm">
            <span className="text-gray-400">All rights reserved. ©2025 PitchEval</span>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-all duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-all duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}