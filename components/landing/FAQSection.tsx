'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

const faqs = [
  {
    question: 'What file formats does PitchEval support?',
    answer: 'PitchEval supports PDF files up to 10MB each. Our advanced AI technology analyzes PDF content with high accuracy, providing detailed feedback on your presentations.'
  },
  {
    question: 'How accurate is the AI evaluation?',
    answer: 'Our AI evaluation system has a 95% accuracy rate, trained on thousands of pitch presentations. It evaluates four key criteria: feasibility, innovation, impact, and clarity, providing consistent and unbiased scoring.'
  },
  {
    question: 'Can I use PitchEval for hackathon judging?',
    answer: 'Absolutely! PitchEval offers a dedicated Hackathon Mode where you can upload up to 20 presentations, set custom scoring weights, and get ranked results with Excel export functionality.'
  },
  {
    question: 'How long does the evaluation process take?',
    answer: 'Individual evaluations typically complete within 1-2 minutes. Bulk hackathon evaluations process multiple files in parallel, usually completing within 5-10 minutes depending on the number of submissions.'
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-32 px-4 relative">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-orange-400 text-sm font-medium">Faq</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Still Confused?
            <br />
            <span className="text-orange-500">We've Got Answers.</span>
          </h2>
          <p className="text-lg text-gray-400">
            Everything you need to know before we roast your pitch.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden hover:border-orange-500/30 transition-all duration-300"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-white text-lg pr-4">{faq.question}</span>
                <div className="flex-shrink-0">
                  <Plus 
                    className={`w-6 h-6 text-gray-400 group-hover:text-orange-400 transition-all duration-300 ${
                      openIndex === index ? 'rotate-45' : ''
                    }`}
                  />
                </div>
              </button>
              {openIndex === index && (
                <div className="px-8 pb-6 border-t border-gray-700/30">
                  <div className="pt-4">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}