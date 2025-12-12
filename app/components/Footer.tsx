"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { MapPin, Phone, Send, Mail, Facebook, Instagram, Youtube, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("API error:", data)
        alert(`Error: ${data.error || 'Failed to send message'}`)
        setIsSubmitting(false)
        return
      }

      // success!
      setFormData({ name: "", email: "", message: "" })
      setIsSubmitting(false)
      setIsSubmitted(true)

    } catch (err) {
      console.error("Request failed:", err)
      alert('Failed to send message. Please try again.')
      setIsSubmitting(false)
    }
  }


  return (
    <footer className="bg-[#1e3a5f]">
      {/* Contact Section */}
      <div className="py-14 md:py-22">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#c9a227] uppercase tracking-[0.2em] text-sm font-medium">
                Get In Touch
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mt-4">
                Let's Start a <span className="font-semibold">Conversation</span>
              </h2>
              <div className="w-16 h-0.5 bg-[#c9a227] mt-6 mb-8" />
              <p className="text-white/70 leading-relaxed mb-10">
                Whether you have questions about our programs, want to partner with us,
                or need support for your ministry, we're here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Our Location</p>
                    <p className="text-white/60 text-sm mt-1">
                      PO Box 1119<br />
                      Loma Linda, CA 92354
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-white/60 text-sm mt-1">(909) 361-7762</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-white/60 text-sm mt-1">contact@empowermg.org</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {isSubmitted ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-16 h-16 rounded-full bg-[#c9a227]/20 flex items-center justify-center mb-6">
                    <Send className="w-7 h-7 text-[#c9a227]" />
                  </div>
                  <h3 className="text-white text-2xl font-semibold mb-3">Thank You!</h3>
                  <p className="text-white/70 leading-relaxed">
                    We look forward to connecting with you soon. Our team will reach out shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <h3 className="text-white text-xl font-semibold mb-6">Send Us a Message</h3>

                  <div className="space-y-5">
                    <div>
                      <Input
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 rounded-xl focus:border-[#c9a227] focus:ring-[#c9a227]"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 rounded-xl focus:border-[#c9a227] focus:ring-[#c9a227]"
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl min-h-[140px] focus:border-[#c9a227] focus:ring-[#c9a227]"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-xl font-medium transition-colors"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image src="/logo_white.png" alt="Empower Ministry Logo" width={200} height={50} />
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-white/60 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/projects" className="text-white/60 hover:text-white transition-colors">
                Projects
              </Link>
              <Link href="/donate" className="text-white/60 hover:text-white transition-colors">
                Donate
              </Link>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com/eckcm/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#c9a227] hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/eckcm.em/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#c9a227] hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.youtube.com/@ECKCM-fz8bc" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-[#c9a227] hover:text-white transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Empower Ministry Group. All rights reserved. A 501(c)(3) Non-Profit Organization.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
