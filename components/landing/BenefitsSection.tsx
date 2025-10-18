export default function BenefitsSection() {
  return (
    <section id="benefits" className="py-32 px-4 relative">
      {/* Grid Background */}
      <div className="absolute inset-0 dot-grid"></div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 card-glow">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-blue-400 text-sm font-medium">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
            <br />
            for Your Pitch
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Six powerful features to help you perfect your pitch
            <br />
            and stand out in front of judges.
          </p>
        </div>

        {/* Features Grid - 6 Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Row 1 */}
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 card-glow">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">AI-Powered Analysis</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Advanced AI evaluates presentations on
              <br />
              feasibility, innovation, impact, and clarity.
            </p>
          </div>

          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 card-glow">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Instant Feedback</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Get detailed scores and 5 actionable
              <br />
              improvement suggestions in seconds.
            </p>
          </div>

          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 card-glow">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">Bulk Evaluation</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Upload up to 20 presentations for
              <br />
              hackathon-scale evaluation and ranking.
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 card-glow">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">Weighted Scoring</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Customize evaluation criteria weights
              <br />
              to match your hackathon requirements.
            </p>
          </div>

          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 card-glow">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">Comprehensive Reports</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Download detailed PDF reports and
              <br />
              Excel exports for complete documentation.
            </p>
          </div>

          <div className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 card-glow">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">PDF Analysis</h3>
            <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Supports PDF files with
              <br />
              advanced AI-powered content analysis.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}