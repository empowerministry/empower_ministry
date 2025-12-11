"use client"

import { motion } from 'framer-motion'

const milestones = [
  {
    year: '2002-2005',
    title: 'The Beginning',
    description: 'In 2002, Empower Ministry began as a grassroots initiative launching the Empower Leadership Conference, a five- to seven-day annual event in Southern California, gathering young leaders for worship, leadership development, and ministry networking.',
  },
  {
    year: '2006-2011',
    title: 'Incorporation and Expansion',
    description: 'To strengthen its organizational foundation, Empower Ministry Group, Inc. was formally incorporated in 2006 as a California Nonprofit Religious Corporation.',
  },
  {
    year: '2012-2018',
    title: 'Ministry Development',
    description: 'EMG emerged as a supporting hub for ministry, providing leadership resources, retreats, and conferences, establishing Loma Linda University scholarships and fostering mission engagement through KAYAMM youth movements.',
  },
  {
    year: '2019-Present',
    title: 'Youth Leadership Launch',
    description: 'In 2019, EMG began organizing and supporting the West Coast Korean Campmeeting, an annual spiritual gathering attendees from across North America and in 2024, expanded its support to the East Coast Korean Campmeeting. In 2026, EMG recruited Dr. D. David Kim and Paul Jeon to join Dr. Chin H. Kim to its board to continue Empowering Ministries for Possibilities.',
  },
]

export default function JourneyTimeline() {
  return (
    <section className="py-24 md:py-32 bg-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[#c9a227] uppercase tracking-[0.2em] text-sm font-medium">
            Our Journey
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mt-4">
            A timeline of our <span className="font-semibold">growth and impact</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a227] mx-auto mt-6" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />

          <div className="space-y-12 md:space-y-0">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`md:flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                    <span className="text-[#c9a227] text-3xl md:text-4xl font-light">
                      {milestone.year}
                    </span>
                    <h3 className="text-white text-xl font-semibold mt-3 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#c9a227] border-4 border-[#1e3a5f]" />
                </div>

                {/* Spacer */}
                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
