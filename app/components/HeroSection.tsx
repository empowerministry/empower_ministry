"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Hero1 from '../../public/XAN01482.jpg'
import Hero2 from '../../public/XAN01606.jpg'
import Hero3 from '../../public/XAN01849.jpg'
import Hero4 from '../../public/XAN01856.jpg' 

const slides = [
  '/XAN01849.jpg',
  '/XAN01856.jpg',
  '/XAN01482.jpg',
  '/XAN01606.jpg',
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const scrollToNext = () => {
    document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-[70vh] md:h-[75vh] w-full overflow-hidden">
      {/* Slideshow Background */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide}
          src={slides[currentSlide]}
          alt="AYP.ME"
          initial={{ opacity: .7, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 1, scale: 1 }}
          transition={{ duration: 4 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/50 via-[#1e3a5f]/30 to-[#1e3a5f]/50" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            
          </motion.div>

          {/* Main Headline - Empower Ministry (larger) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-tight"
          >
            Empower
            <br />
            <span className="font-semibold">Ministry Group</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="w-24 h-0.5 bg-[#c9a227] mx-auto mt-8"
          />

          {/* Tagline - Creating Ministry Possibilities (smaller) */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[#c9a227] uppercase tracking-[0.3em] text-sm md:text-base mt-4 font-medium"
          >
            Creating Ministry Possibilities
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          onClick={scrollToNext}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  )
}
