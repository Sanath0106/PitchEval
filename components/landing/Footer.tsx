import Logo from '@/components/ui/Logo'

export default function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-gray-800/50 bg-black/50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo */}
          <Logo className="flex items-center space-x-3 mb-6 md:mb-0" />
          
          {/* Footer Links */}
          <div className="flex items-center space-x-8 text-sm">
            <span className="text-gray-400">All right reserved. ©2025</span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              License
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Changelog
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}