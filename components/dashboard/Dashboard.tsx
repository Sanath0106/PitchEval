import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Users, FileText, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import AppHeader from '@/components/ui/AppHeader'
import RecentEvaluations from './RecentEvaluations'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-gradient-shift"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-60 right-1/3 w-64 h-64 bg-green-500/6 rounded-full blur-3xl animate-gradient-shift" style={{animationDelay: '6s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/40 rounded-full animate-particle-float"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-particle-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-particle-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-orange-300/30 rounded-full animate-particle-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-green-400/30 rounded-full animate-particle-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-particle-float" style={{animationDelay: '5s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-pulse"></div>
        
        {/* Subtle moving gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent animate-gradient-wave"></div>
        
        {/* Additional depth layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,53,0.03),transparent_70%)]"></div>
      </div>

      <AppHeader variant="dashboard" />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent animate-pulse">
            Welcome to PitchEval
          </h1>
          <p className="text-gray-400">Choose how you want to evaluate your presentations</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:bg-gray-800/70 group card-glow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-orange-400 group-hover:text-orange-300" />
              </div>
              <CardTitle className="text-xl text-white group-hover:text-orange-100 transition-colors">Personal Upload</CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Upload a single presentation for AI evaluation and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>Single PDF upload</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <span>Detailed scoring & feedback</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FileText className="w-4 h-4" />
                  <span>Downloadable report</span>
                </div>
                <Link href="/dashboard/personal">
                  <Button className="w-full mt-4" variant="orange">
                    Start Personal Evaluation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-gray-800/70 group card-glow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              </div>
              <CardTitle className="text-xl text-white group-hover:text-blue-100 transition-colors">Hackathon Mode</CardTitle>
              <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                Bulk upload and evaluate multiple presentations for events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Upload className="w-4 h-4" />
                  <span>Upload up to 20 files</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <BarChart3 className="w-4 h-4" />
                  <span>Weighted scoring system</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Ranked results & Excel export</span>
                </div>
                <Link href="/dashboard/hackathon">
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300">
                    Start Hackathon Evaluation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-transparent">
            Recent Evaluations
          </h2>
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/30 p-1">
            <RecentEvaluations />
          </div>
        </div>
      </main>
    </div>
  )
}