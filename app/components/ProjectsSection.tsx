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
    title: 'East Coast Korean Camp Meeting',
    category: 'Event',
    description: 'Annual social and spiritual gathering for the Korean community on the East Coast.',
    longDescription: 'Our flagship community program works with over 30 local churches to identify and serve families in need. We provide food assistance, clothing drives, job training resources, and spiritual counseling. Each year, we reach over 2,000 families, helping them build stronger foundations for their futures.',
    image: 'https://lh3.googleusercontent.com/proxy/U7kHTS1TVOn9cRqMRBtK-d1PuXwGqJIn8bNTLZ8MyzFVP8MQoEy_UsnygcnKBXTZXoarYdYoIHejDaZpX7WK8-waaliEKuM',
    impact: '1,000+ families served annually',
    location: 'Johnstown University, PA',
  },
  {
    id: 2,
    title: 'West Coast Korean Camp Meeting',
    category: 'Event',
    description: 'Annual social and spiritual gathering for the Korean community on the West Coast.',
    longDescription: 'Our flagship community program works with over 30 local churches to identify and serve families in need. We provide food assistance, clothing drives, job training resources, and spiritual counseling. Each year, we reach over 2,000 families, helping them build stronger foundations for their futures.',
    image: 'https://storage.googleapis.com/production-mydomaincom-v1-0-0/070/1762070/zTIthe1J/8dcb68546650402e9658c3d3de1436bf',
    impact: '1,000+ families served annually',
    location: 'Nationwide',
  },
  {
    id: 3,
    title: 'Spiritual Innovation Lab for Young Leaders',
    category: 'Ledership Development',
    description: 'Developing the next generation of ministry leaders through mentorship, training, and hands-on experience.',
    longDescription: 'Our comprehensive youth program identifies promising young leaders aged 16-25 and provides them with biblical training, leadership development workshops, and real-world ministry experience. Graduates of our program have gone on to serve in churches across the nation and around the world.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    impact: '500+ leaders trained',
    location: 'Nationwide',
  },
]

export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  return (
    <section className="py-24 md:py-32 bg-white">
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
                    <Link href="/donate" className="flex-1">
                      <Button className="w-full bg-[#c9a227] hover:bg-[#b8922a] text-white h-12 rounded-xl">
                        Support This Project
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
