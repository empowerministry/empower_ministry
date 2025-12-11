"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'

const leaders = [
  {
    name: 'D. David Kim',
    role: 'Executive Director',
    bio: 'With over 25 years in ministry leadership, David founded Empower Ministry Group to bridge the gap between vision and resources.',
    image: '/david.jpg',
  },
  {
    name: 'Chin H. Kim',
    role: 'Finance Director',
    bio: 'Sarah brings 15 years of non-profit management experience, ensuring our programs run smoothly and effectively.',
    image: '/chin.jpg',
  },
  {
    name: 'Paul Jeon',
    role: 'Director of Operations',
    bio: 'Michael leads our community initiatives, building bridges between churches and the communities they serve.',
    image: '/paul.jpg',
  },
  {
    name: 'Danny Kim',
    role: 'Strategic Consultant/CEO QuestX',
    bio: 'Rachel oversees our youth leadership and training programs, nurturing the next generation of ministry leaders.',
    image: '/danny.jpg',
  },
]

export default function LeadershipTeam() {
  return (
    <section className="py-24 md:py-32 bg-[#faf8f5]">
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
            Our Leadership
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1e3a5f] mt-4">
            Meet the <span className="font-semibold">Team</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a227] mx-auto mt-6" />
          <p className="text-[#64748b] mt-6 max-w-2xl mx-auto">
            Our dedicated leadership team brings together decades of ministry experience,
            united by a shared passion for empowering communities.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                <Image
                  src={leader.image}
                  alt={leader.name}
                  fill
                  className="object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <h3 className="text-[#1e3a5f] text-lg font-semibold">
                {leader.name}
              </h3>
              <p className="text-[#c9a227] text-sm font-medium mt-1">
                {leader.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
