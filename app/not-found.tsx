'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { Trophy, Target, Zap, Home } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()
  const [trollLevel, setTrollLevel] = useState(0)

  const trollMessages = [
    <>Lost your way? <span className="emoji">🤔</span></>,
    <>Just like you lost your last hackathon? <span className="emoji">😏</span></>,
    <>404: Page not found. Unlike your winning strategy! <span className="emoji">🏆</span></>,
    <>Oops! This page is as missing as your project documentation <span className="emoji">📝</span></>,
    <>Error 404: Success not found in your recent projects <span className="emoji">💀</span></>
  ]

  const encouragingMessages = [
    <>But hey, every great developer gets lost sometimes! <span className="emoji">🚀</span></>,
    <>Even the best hackers take wrong turns <span className="emoji">💻</span></>,
    <>404 errors happen to the best of us <span className="emoji">🛠️</span></>,
    <>This is just a minor bug in your navigation <span className="emoji">🐛</span></>,
    <>Consider this a feature, not a bug! <span className="emoji">✨</span></>
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTrollLevel(prev => (prev + 1) % trollMessages.length)
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])



  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Spectacular Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Multi-colored gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl animate-gradient-shift"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/12 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '6s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-56 h-56 bg-green-500/6 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '8s'}}></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/60 rounded-full animate-particle-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-400/50 rounded-full animate-particle-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-particle-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-particle-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-green-400/40 rounded-full animate-particle-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-particle-float" style={{animationDelay: '5s'}}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-pulse"></div>
        
        {/* Rainbow gradient wave */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/8 via-red-500/6 via-purple-500/8 via-blue-500/6 to-transparent animate-gradient-wave"></div>
        
        {/* Additional depth layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.08),transparent_70%)]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 bg-gray-900/30 backdrop-blur-sm border-b border-gray-800/50">
        <Logo />
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">

        {/* Giant 404 with Spectacular Animation */}
        <div className="mb-8 relative animate-fade-in-up">
          <h1 className="text-[12rem] md:text-[16rem] font-black text-transparent bg-gradient-to-r from-orange-500 via-red-500 via-purple-500 to-blue-500 bg-clip-text leading-none transition-all duration-1000 ease-out hover:scale-110 hover:rotate-1 cursor-pointer">
            404
          </h1>
          <div className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-orange-500/10 leading-none animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-[12rem] md:text-[16rem] font-black text-transparent bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text leading-none animate-gradient-wave opacity-30">
            404
          </div>

          {/* Smoothly Floating Icons */}
          <Trophy className="absolute top-20 -right-8 w-6 h-6 text-yellow-400 animate-float-delayed hover:scale-125 transition-transform duration-300" />
          <Target className="absolute -bottom-5 left-5 w-7 h-7 text-orange-400 animate-float-slow hover:scale-125 transition-transform duration-300" />
          <Zap className="absolute -bottom-10 -right-5 w-5 h-5 text-blue-400 animate-float-fast hover:scale-125 transition-transform duration-300" />
        </div>

        {/* Smoothly Transitioning Messages */}
        <div className="mb-8 max-w-2xl bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6 card-glow">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent transition-all duration-700 ease-in-out transform">
            {trollMessages[trollLevel]}
          </h2>
          <p className="text-xl text-gray-300 mb-4 transition-all duration-700 ease-in-out transform">
            {encouragingMessages[trollLevel]}
          </p>

          {/* Smoothly Animated Subtitle */}
          <div className="text-lg text-orange-400 font-medium transition-all duration-500 ease-in-out">
            {trollLevel === 0 && <span className="animate-fade-in"><span className="emoji">🧭</span> Navigation skills: 404 not found</span>}
            {trollLevel === 1 && <span className="animate-fade-in"><span className="emoji">🏆</span> Recent wins: Empty array []</span>}
            {trollLevel === 2 && <span className="animate-fade-in"><span className="emoji">📊</span> Success rate: NaN%</span>}
            {trollLevel === 3 && <span className="animate-fade-in"><span className="emoji">📚</span> Documentation: undefined</span>}
            {trollLevel === 4 && <span className="animate-fade-in"><span className="emoji">💡</span> Bright ideas: null</span>}
          </div>
        </div>

        {/* Home Button */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-110 transition-all duration-500 ease-out transform card-glow"
            size="lg"
          >
            <Home className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
            <span>Take Me Home</span>
          </Button>
        </div>



        {/* Motivational Footer */}
        <div className="mt-12 max-w-lg">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-orange-500/10 card-glow">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              <span className="emoji">🚀</span> Ready to get back on track?
            </h3>
            <p className="text-gray-300 text-sm">
              Every 404 is just a detour to success. Upload your next presentation and let our AI help you win that hackathon!
            </p>
          </div>
        </div>
      </div>

      {/* Floating Code Snippets */}
      <div className="absolute top-1/4 left-5 text-xs text-gray-600 font-mono opacity-50 animate-pulse">
        if (success) &#123;<br />
        &nbsp;&nbsp;return "<span className="emoji">🏆</span>";<br />
        &#125; else &#123;<br />
        &nbsp;&nbsp;return "404";<br />
        &#125;
      </div>

      <div className="absolute bottom-1/4 right-5 text-xs text-gray-600 font-mono opacity-50 animate-pulse" style={{ animationDelay: '1s' }}>
        console.log("Where am I?");<br />
        // TODO: Find the right path<br />
        // FIXME: Navigation broken<br />
        // NOTE: Still lost...
      </div>
    </div>
  )
}