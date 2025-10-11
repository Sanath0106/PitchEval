export default function ProcessSection() {
  return (
    <section id="process" className="py-32 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8 card-glow">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-orange-400 text-sm font-medium">Our Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            From Trash to
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Treasure in 3 Steps
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Turn your mediocre pitch into something judges actually want to hear.
          </p>
        </div>

        {/* Process Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 group card-glow">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-orange-400">1</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-orange-100 transition-colors">
              Upload Your Presentation
            </h3>
            
            <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed mb-8 transition-colors">
              Upload your presentation file and
              <br />
              select your project domain.
              <br />
              That's it - we handle the rest.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 group card-glow">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-blue-400">2</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-blue-100 transition-colors">
              AI Analysis & Scoring
            </h3>
            
            <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed mb-8 transition-colors">
              Our AI analyzes your content and
              <br />
              scores feasibility, innovation, impact,
              <br />
              and clarity in under 2 minutes.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 group card-glow">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-green-100 transition-colors">
              Get Results & Improve
            </h3>
            
            <p className="text-gray-400 group-hover:text-gray-300 leading-relaxed mb-8 transition-colors">
              Get detailed scores, 5 improvement
              <br />
              suggestions, and a downloadable
              <br />
              PDF report to perfect your pitch.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}