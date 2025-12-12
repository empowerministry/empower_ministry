"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Users, Globe, BookOpen, Heart, Home as HomeIcon, Utensils, Calendar } from 'lucide-react'
import { Button } from '../components/ui/button'
import Link from 'next/link'
import Footer from '../components/Footer'

const categories = ['All', 'Community', 'Education', 'International', 'Humanitarian', 'Event', 'Leadership Development']

const projects = [
  {
    id: 1,
    title: 'East Coast Korean Camp Meeting',
    category: 'Event',
    icon: Calendar,
    description: 'Annual social and spiritual gathering for the Korean community on the East Coast.',
    longDescription: 'East Coast Campmeeting is a week-long retreat that brings together Korean churches from across the eastern United States. The gathering provides a dedicated time for fellowship, shared activities, spiritual renewal, and biblical education. The purpose of the retreat is to strengthen community among believers on the East Coast and to deepen our collective relationship with God.',
    image: '/eckcm.jpg',
    impact: '1,000+ families served annually',
    location: 'University of Pittsburg at Johnstown, PA',
    link: 'https://eckcm.com', // Add your link here
  },
  {
    id: 2,
    title: 'West Coast Korean Camp Meeting',
    category: 'Event',
    icon: Calendar,
    description: 'Annual social and spiritual gathering for the Korean community on the West Coast.',
    longDescription: 'West Coast Korean Camp Meeting is a collaborative event amongst the Korean-American Seventh-day Adventist Churches across the western states of America. Its purpose is to exalt the Lord Jesus Christ by experiencing the synergy of a united church community, discipling our leaders and members, and influencing the trend and patterns of our individual Korean churches across America.',
    image: 'https://storage.googleapis.com/production-mydomaincom-v1-0-0/070/1762070/zTIthe1J/8dcb68546650402e9658c3d3de1436bf',
    impact: '1,000+ families served annually',
    location: 'Pacific Union College, CA',
    link: 'https://wckcm.org', // Add your link here
  },
  {
    id: 3,
    title: 'Community Outreach Initiative',
    category: 'Community',
    icon: Users,
    description: 'Connecting local churches with underserved neighborhoods to provide essential resources and spiritual guidance.',
    longDescription: 'Our flagship community program works with over 30 local churches to identify and serve families in need. We provide food assistance, clothing drives, job training resources, and spiritual counseling. Each year, we reach over 2,000 families, helping them build stronger foundations for their futures.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    impact: '2,000+ families served annually',
    location: 'Metro Atlanta Area',
    link: '#', // Add your link here
  },
  {
    id: 4,
    title: 'Youth Leadership Program',
    category: 'Education',
    icon: BookOpen,
    description: 'Developing the next generation of ministry leaders through mentorship, training, and hands-on experience.',
    longDescription: 'Our comprehensive youth program identifies promising young leaders aged 16-25 and provides them with biblical training, leadership development workshops, and real-world ministry experience. Graduates of our program have gone on to serve in churches across the nation and around the world.',
    image: 'https://plus.unsplash.com/premium_photo-1715588660901-f559d25356e7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    impact: '500+ leaders trained',
    location: 'Nationwide',
    link: '#', // Add your link here
  },
  {
    id: 5,
    title: 'Global Mission Support',
    category: 'International',
    icon: Globe,
    description: 'Partnering with missionaries worldwide to expand their reach and amplify their impact.',
    longDescription: 'We provide financial support, training resources, and administrative assistance to missionaries serving in challenging environments. Our network spans across 15 countries, supporting over 50 missionary families with monthly stipends, emergency funds, and regular care packages.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    impact: '50+ missionaries supported',
    location: '15 Countries',
    link: '#', // Add your link here
  },
  {
    id: 6,
    title: 'Homeless Ministry',
    category: 'Humanitarian',
    icon: HomeIcon,
    description: 'Providing shelter, meals, and pathways to stability for those experiencing homelessness.',
    longDescription: 'Our homeless ministry operates year-round, providing hot meals, warm clothing, and temporary shelter referrals. We partner with local shelters and transitional housing programs to help individuals find permanent housing and employment opportunities.',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
    impact: '10,000+ meals served',
    location: 'Downtown Atlanta',
    link: '#', // Add your link here
  },
  {
    id: 7,
    title: 'Marriage & Family Ministry',
    category: 'Community',
    icon: Heart,
    description: 'Strengthening marriages and families through counseling, workshops, and community support.',
    longDescription: 'We believe strong families build strong communities. Our certified counselors provide pre-marital counseling, marriage enrichment retreats, and family therapy sessions. We also host monthly family nights that bring the community together.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
    impact: '300+ couples counseled',
    location: 'Regional Centers',
    link: '#', // Add your link here
  },
  {
    id: 8,
    title: 'Food Security Initiative',
    category: 'Humanitarian',
    icon: Utensils,
    description: 'Fighting hunger through food banks, community gardens, and nutrition education.',
    longDescription: 'Our food security program addresses hunger at multiple levels. We operate three community food banks, maintain urban gardens that provide fresh produce, and offer nutrition workshops to help families make the most of their resources.',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    impact: '50,000 lbs food distributed',
    location: 'Metro Atlanta Area',
    link: '#', // Add your link here
  },
  
  // {
  //   id: 9,
  //   title: 'Spiritual Innovation Lab for Young Leaders',
  //   category: 'Leadership Development',
  //   icon: BookOpen,
  //   description: 'Developing the next generation of ministry leaders through mentorship, training, and hands-on experience.',
  //   longDescription: 'Our comprehensive youth program identifies promising young leaders aged 16-25 and provides them with biblical training, leadership development workshops, and real-world ministry experience. Graduates of our program have gone on to serve in churches across the nation and around the world.',
  //   image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
  //   impact: '500+ leaders trained',
  //   location: 'Nationwide',
  // },
]

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ================= HERO ================= */}
      <section className="relative py-8 md:py-10 bg-[#1e3a5f] overflow-hidden mt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#c9a227] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#c9a227] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#c9a227] uppercase tracking-[0.3em] text-sm font-medium">
              Our Work
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mt-4">
              Transforming Lives Through
              <br />
              <span className="font-semibold">Purposeful Action</span>
            </h1>
            <div className="w-20 h-0.5 bg-[#c9a227] mx-auto mt-8" />
            <p className="text-white/70 mt-8 max-w-2xl mx-auto text-lg">
              Each of our projects is designed to create lasting impact, empowering communities and individuals to reach their God-given potential.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================ FILTER BUTTONS ================ */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================ PROJECTS GRID ================ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const Icon = project.icon

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/60 to-transparent" />

                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#1e3a5f]">
                            {project.category}
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Icon className="w-4 h-4" />
                            <span>{project.impact}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-[#1e3a5f] group-hover:text-[#c9a227] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-[#64748b] text-sm mt-3 leading-relaxed">
                          {project.description}
                        </p>
                        <div className="mt-4 flex items-center text-[#c9a227] text-sm font-medium">
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

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
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-[#1e3a5f] hover:bg-white transition-colors"
                >
                  ×
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
                    <selectedProject.icon className="w-6 h-6 text-[#c9a227]" />
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

      {/* ================ CTA SECTION ================ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-[#1e3a5f]">
              Ready to Make a <span className="font-semibold">Difference?</span>
            </h2>
            <p className="text-[#64748b] mt-4 max-w-xl mx-auto">
              Your support enables us to continue transforming lives and empowering communities.
              Every contribution, no matter the size, creates lasting impact.
            </p>
            <Link href="/donate">
              <Button className="mt-8 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white h-14 px-10 rounded-xl text-lg">
                Donate Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
