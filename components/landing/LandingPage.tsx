'use client'


import Header from './Header'
import HeroSection from './HeroSection'
import ProcessSection from './ProcessSection'
import BenefitsSection from './BenefitsSection'
import FAQSection from './FAQSection'
import Footer from './Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Spectacular Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Multi-colored gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/12 rounded-full blur-3xl animate-gradient-shift"></div>
        <div className="absolute top-60 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-green-500/6 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '6s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-56 h-56 bg-red-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '8s'}}></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-orange-400/60 rounded-full animate-particle-float"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400/50 rounded-full animate-particle-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-particle-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 right-1/6 w-1 h-1 bg-green-400/40 rounded-full animate-particle-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/6 left-2/3 w-1 h-1 bg-red-400/40 rounded-full animate-particle-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 right-2/3 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-particle-float" style={{animationDelay: '5s'}}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] animate-grid-pulse"></div>
        
        {/* Rainbow gradient wave */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/6 via-blue-500/4 via-purple-500/6 via-green-500/4 to-transparent animate-gradient-wave"></div>
        
        {/* Additional depth layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,107,53,0.06),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.06),transparent_50%)]"></div>
      </div>

      {/* Content with proper z-index */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <ProcessSection />
        <BenefitsSection />
        <FAQSection />
        <Footer />
      </div>
    </div>
  )
}