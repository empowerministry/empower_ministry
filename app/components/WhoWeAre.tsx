"use client"

import { motion } from 'framer-motion'
import { Heart, Users, Globe } from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Compassion',
    description: 'We lead with love, serving communities with genuine care and understanding.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building lasting relationships that strengthen and uplift those we serve.',
  },
  {
    icon: Globe,
    title: 'Impact',
    description: 'Creating meaningful change that resonates across generations.',
  },
]

export default function WhoWeAre() {
  return (
    <section id="who-we-are" className="py-14 md:py-22 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#c9a227] uppercase tracking-[0.2em] text-sm font-medium">
              Who We Are
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#1e3a5f] mt-4 leading-tight">
              Empowering Communities
              <br />
              <span className="font-semibold">Through Faith & Action</span>
            </h2>
            <div className="w-16 h-0.5 bg-[#c9a227] mt-6 mb-8" />
            <p className="text-[#64748b] text-lg leading-relaxed mb-6">
              Empower Ministry Group is a non-profit organization dedicated to revitalizing local ministries. We believe that true empowerment comes from community ownership and strategic partnerships to bring resources and innovation to your ministry's mission.
            </p>
            <p className="text-[#64748b] leading-relaxed">
              Founded on the principles of service, integrity, and collaboration, we believe
              that every ministry has the potential to create lasting positive change. Our
              mission is to provide the resources, guidance, and support needed to turn that
              potential into reality.
            </p>
          </motion.div>

          {/* Right - Values */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#1e3a5f]/5 flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                      {value.title}
                    </h3>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
