"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Donate", path: "/donate" },
]

export default function HeroSection() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isHomePage = pathname === "/"
  const showTransparentHeader = isHomePage && !isScrolled

  // Listen for scrolling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showTransparentHeader
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={showTransparentHeader ? "/logo_white.png" : "/empower_logo.png"}
              alt="Empower Ministry Logo"
              width={168}
              height={40}
              className="w-42 transition-opacity duration-300"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-medium transition-colors relative group ${
                    showTransparentHeader
                      ? "text-white/80 hover:text-white"
                      : "text-gray-600 hover:text-[#1e3a5f]"
                  } ${isActive ? "text-[#c9a227]" : ""}`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#c9a227] transition-all ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              showTransparentHeader
                ? "text-white hover:bg-white/10"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              showTransparentHeader
                ? "bg-white/20 border-t border-white/20"
                : "bg-white border-t border-gray-100"
            }`}
          >
            <nav className="max-w-7xl mx-auto px-6 py-6 space-y-4 items-end flex flex-col">
              {navLinks.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-medium transition-colors text-right ${
                      showTransparentHeader
                        ? "text-white/90 hover:text-white"
                        : "text-gray-700 hover:text-[#1e3a5f]"
                    } ${isActive ? "text-[#c9a227]" : ""}`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
