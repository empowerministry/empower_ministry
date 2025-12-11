"use client"

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function HeroSection() {
  const scrollToNext = () => {
    document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="/grass_placeholder.jpg"
      >
        <source
          src="/grass.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/70 via-[#1e3a5f]/70 to-[#1e3a5f]/70" />

      {/* Content */}
      <div className="
        relative z-10 h-full flex flex-col items-center
        justify-start pt-72
        md:justify-center md:pt-0
        px-6
        ">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[#c9a227] uppercase tracking-[0.3em] text-sm md:text-base mb-4 font-medium"
          >
            Empower Ministry Group
          </motion.p>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-tight"
          >
            Creating Ministry
            <br />
            <span className="font-semibold">Possibilities</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="w-24 h-0.5 bg-[#c9a227] mx-auto mt-8"
          />
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          onClick={scrollToNext}
          className="absolute bottom-52 md:bottom-20 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-15 h-15" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  )
}
