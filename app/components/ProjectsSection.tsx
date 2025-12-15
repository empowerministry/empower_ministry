"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import Image from 'next/image'

const projects = [
  {
    id: 1,
    title: 'Korean Camp Meetings',
    category: 'Event',
    description: 'Providing infrastructure support for the Annual social and spiritual gathering for the Korean communities in the East and West Coast.',
    longDescription: 'East Coast Campmeeting is a week-long retreat that brings together Korean churches from across the United States. The gathering provides a dedicated time for fellowship, shared activities, spiritual renewal, and biblical education. The purpose of the retreat is to strengthen community among believers on the East Coast and to deepen our collective relationship with God.',
    image: '/eckcm.jpg',
    impact: '1,000+ families served annually',
    location: 'Pennsylvania and California',
    link: '#', // Add your link here
  },
  {
    id: 2,
    title: 'Spiritual Innovation Lab',
    category: 'Leadership Development',
    description: 'Matching young leaders\' passions with innovative ministry opportunities to create lasting impact.',
    longDescription: 'Our Spiritual Innovation Lab identifies promising young leaders and equips them with the resources, mentorship, and funding needed to launch innovative ministry projects that address contemporary challenges in our communities.',
    image: '/AYP.ME.webp',
    impact: 'Developing',
    location: 'Nationwide',
    link: '#', // Add your link here
  },
  {
    id: 3,
    title: 'Youth Leadership Program',
    category: 'Education',
    description: 'Developing the next generation of ministry leaders through mentorship, training, and hands-on experience.',
    longDescription: 'Our comprehensive youth program identifies promising young leaders aged 16-25 and provides them with biblical training, leadership development workshops, and real-world ministry experience. Graduates of our program have gone on to serve in churches across the nation and around the world.',
    image: 'https://plus.unsplash.com/premium_photo-1715588660901-f559d25356e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    impact: 'Future leaders trained',
    location: 'Nationwide',
    link: '#', // Add your link here
  },
]

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  return (
    <section className="py-14 md:py-22 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[#c9a227] uppercase tracking-[0.2em] text-sm font-medium">
            Our Projects
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1e3a5f] mt-4">
            Making a <span className="font-semibold">Difference</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a227] mx-auto mt-6" />
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[#c9a227] text-xs uppercase tracking-wider font-medium">
                    {project.category}
                  </span>
                  <h3 className="text-white text-xl font-semibold mt-2">
                    {project.title}
                  </h3>
                </div>
              </div>
              <p className="text-[#64748b] mt-4 leading-relaxed text-sm">
                {project.description}
              </p>
              <div className="mt-4 flex items-center text-[#c9a227] text-sm font-medium">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[#1e3a5f] font-medium hover:text-[#c9a227] transition-colors group"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Project Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative aspect-video">
                  <Image
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#1e3a5f] hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-[#1e3a5f]/10 rounded-full text-xs font-medium text-[#1e3a5f]">
                      {selectedProject.category}
                    </span>
                    <span className="text-[#64748b] text-sm">
                      {selectedProject.location}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[#1e3a5f]">
                    {selectedProject.title}
                  </h2>
                  <p className="text-[#64748b] mt-4 leading-relaxed">
                    {selectedProject.longDescription}
                  </p>
                  <div className="mt-6 p-4 bg-[#faf8f5] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#c9a227]" />
                      <div>
                        <p className="text-sm text-[#64748b]">Impact</p>
                        <p className="font-semibold text-[#1e3a5f]">{selectedProject.impact}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <Link href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full bg-[#c9a227] hover:bg-[#b8922a] text-white h-12 rounded-xl">
                        Learn More / Support
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProject(null)}
                      className="h-12 px-6 rounded-xl border-gray-200"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
