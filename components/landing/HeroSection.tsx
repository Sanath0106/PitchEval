import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-24">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-background"></div>
      
      {/* Enhanced floating elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-orange-500/15 rounded-full blur-xl animate-float-slow"></div>
      <div className="absolute bottom-32 left-16 w-24 h-24 bg-blue-500/20 rounded-full blur-lg animate-float-delayed"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-purple-500/15 rounded-full blur-lg animate-float-fast"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-green-500/10 rounded-full blur-xl animate-float"></div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-orange-400 text-sm font-medium">AI Pitch Evaluation</span>
        </div>
        
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          No Bias. No Politics.
          <br />
          <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
            Just Brutal Honesty.
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Get AI-powered pitch feedback that doesn't care about college names or judge moods.
          <br />
          Perfect your story before it hits the real stage.
        </p>
        
        {/* CTA Button */}
        <SignInButton mode="modal">
          <Button 
            size="lg" 
            className="text-lg px-10 py-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-500 hover:scale-110 card-glow"
          >
            Roast My Pitch
          </Button>
        </SignInButton>
        
        {/* Dashboard Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/70 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/60 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:scale-[1.02] card-glow">
            <div className="bg-gray-900/95 rounded-2xl p-6 border border-gray-700/40">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <span className="text-white font-semibold text-lg">PitchEval</span>
                </div>
                <div className="text-gray-400 text-sm">Last 7 Days ▼</div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 card-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400 text-sm">Features</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent mb-1">Beta</div>
                  <div className="text-orange-500 text-sm font-medium">↗ early access available</div>
                </div>
                
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 card-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400 text-sm">Criteria</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-1">4</div>
                  <div className="text-blue-500 text-sm font-medium">↗ evaluation dimensions</div>
                </div>
                
                <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 card-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400 text-sm">Time Saved</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent mb-1">2min</div>
                  <div className="text-green-500 text-sm font-medium">↗ average analysis time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}