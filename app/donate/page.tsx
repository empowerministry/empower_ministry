"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { CreditCard, Lock, Heart, Calendar, Gift, Loader2, Check, ArrowRight, Users, BookOpen, Globe } from 'lucide-react'
import { toast } from 'sonner'
import Footer from '../components/Footer'

const presetAmounts = [25, 50, 100, 250, 500, 1000]

export default function Donate() {
  const [showForm, setShowForm] = useState(false)
  const [donationType, setDonationType] = useState('one-time')
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    billingZip: '',
  })

  const amount = customAmount ? parseFloat(customAmount) : selectedAmount

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500))

    setIsProcessing(false)
    setIsComplete(true)
    toast.success('Thank you for your generous donation!')
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-semibold text-[#1e3a5f] mb-4">
            Thank You!
          </h1>
          <p className="text-[#64748b] mb-2">
            Your {donationType === 'monthly' ? 'monthly' : ''} donation of <span className="font-semibold text-[#1e3a5f]">${amount.toFixed(2)}</span> has been received.
          </p>
          <p className="text-[#64748b] mb-8">
            A confirmation email has been sent to {formData.email}
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white h-12 px-8 rounded-xl"
          >
            Return Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="relative py-8 md:py-10 bg-[#1e3a5f] overflow-hidden mt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a227] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white">
              Make a <span className="font-semibold">Donation</span>
            </h1>
            <div className="w-20 h-0.5 bg-[#c9a227] mx-auto m-8" />
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 p-2 rounded-full">
              <Heart className="w-4 h-4 text-[#c9a227]" />
              <span className="text-white/80 text-sm">Your generosity changes lives</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Message */}
      <section className="py-16 md:py-20 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-light text-[#1e3a5f] mb-6">
              Your Gift Creates <span className="font-semibold">Lasting Impact</span>
            </h2>
            <p className="text-[#64748b] leading-relaxed mb-8 text-lg">
              Every donation to Empower Ministry Group directly fuels our mission to transform lives and strengthen communities. Your generosity makes it possible for us to reach those in need and create meaningful, lasting change.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="bg-[#faf8f5] rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-[#1e3a5f]" />
                </div>
                <h3 className="font-semibold text-[#1e3a5f] mb-2">Community Programs</h3>
                <p className="text-sm text-[#64748b]">
                  Feed families, provide shelter resources, and deliver essential support to underserved neighborhoods.
                </p>
              </div>

              <div className="bg-[#faf8f5] rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-[#1e3a5f]" />
                </div>
                <h3 className="font-semibold text-[#1e3a5f] mb-2">Youth Development</h3>
                <p className="text-sm text-[#64748b]">
                  Train and mentor the next generation of ministry leaders through education and hands-on experience.
                </p>
              </div>

              <div className="bg-[#faf8f5] rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-[#1e3a5f]" />
                </div>
                <h3 className="font-semibold text-[#1e3a5f] mb-2">Global Missions</h3>
                <p className="text-sm text-[#64748b]">
                  Support missionaries worldwide with resources, training, and financial assistance to expand their reach.
                </p>
              </div>
            </div>

            <p className="text-[#64748b] mt-10 text-sm">
              <span className="font-medium text-[#1e3a5f]">100% of your donation</span> goes directly to our programs.
              As a registered 501(c)(3) organization, your gift is fully tax-deductible.
            </p>

            {!showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10"
              >
                <Button
                  onClick={() => setShowForm(false)}
                  className="bg-[#c9a227] hover:bg-[#b8922a] text-white h-14 px-10 rounded-xl text-lg font-medium"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  We're setting up our secure payment system. Please check back shortly.
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Donation Form */}
      {showForm && (
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Donation Type */}
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-[#1e3a5f] mb-6">
                  Choose Donation Type
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* One-Time Donation */}
                  <button
                    type="button"
                    onClick={() => setDonationType("one-time")}
                    className={`p-5 rounded-xl border-2 transition-all duration-300
                      flex flex-col md:flex-row items-center md:items-start
                      gap-4 text-center md:text-left
                      ${
                        donationType === "one-time"
                          ? "border-[#c9a227] bg-[#c9a227]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        donationType === "one-time" ? "bg-[#c9a227]/20" : "bg-gray-100"
                      }`}
                    >
                      <Gift
                        className={`w-5 h-5 ${
                          donationType === "one-time" ? "text-[#c9a227]" : "text-gray-400"
                        }`}
                      />
                    </div>

                    <div>
                      <p
                        className={`font-medium ${
                          donationType === "one-time"
                            ? "text-[#1e3a5f]"
                            : "text-gray-600"
                        }`}
                      >
                        One-Time
                      </p>
                      <p className="text-sm text-gray-500">Single donation</p>
                    </div>
                  </button>

                  {/* Monthly Donation */}
                  <button
                    type="button"
                    onClick={() => setDonationType("monthly")}
                    className={`p-5 rounded-xl border-2 transition-all duration-300
                      flex flex-col md:flex-row items-center md:items-start
                      gap-4 text-center md:text-left
                      ${
                        donationType === "monthly"
                          ? "border-[#c9a227] bg-[#c9a227]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        donationType === "monthly" ? "bg-[#c9a227]/20" : "bg-gray-100"
                      }`}
                    >
                      <Calendar
                        className={`w-5 h-5 ${
                          donationType === "monthly" ? "text-[#c9a227]" : "text-gray-400"
                        }`}
                      />
                    </div>

                    <div>
                      <p
                        className={`font-medium ${
                          donationType === "monthly"
                            ? "text-[#1e3a5f]"
                            : "text-gray-600"
                        }`}
                      >
                        Monthly
                      </p>
                      <p className="text-sm text-gray-500">Recurring gift</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-[#1e3a5f] mb-6">Select Amount</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt)
                        setCustomAmount('')
                      }}
                      className={`py-4 rounded-xl font-medium transition-all duration-300 ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-[#1e3a5f] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-8 h-14 text-lg rounded-xl border-gray-200 focus:border-[#c9a227] focus:ring-[#c9a227]"
                  />
                </div>
              </div>

              {/* Donor Information */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#1e3a5f]">Your Information</h2>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                    />
                    <Label htmlFor="anonymous" className="text-sm text-gray-600 cursor-pointer">
                      Make this donation anonymous
                    </Label>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-12 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-12 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Phone (optional)</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-[#1e3a5f]" />
                  <h2 className="text-xl font-semibold text-[#1e3a5f]">Payment Details</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Card Number</Label>
                    <div className="relative">
                      <Input
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="h-12 rounded-xl border-gray-200 pr-20"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-8 h-5 bg-blue-600 rounded text-white text-[8px] flex items-center justify-center font-bold">VISA</div>
                        <div className="w-8 h-5 bg-red-500 rounded text-white text-[8px] flex items-center justify-center font-bold">MC</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Expiry</Label>
                      <Input
                        value={formData.expiry}
                        onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="h-12 rounded-xl border-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">CVC</Label>
                      <Input
                        type="password"
                        value={formData.cvc}
                        onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        maxLength={4}
                        className="h-12 rounded-xl border-gray-200"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">ZIP Code</Label>
                      <Input
                        value={formData.billingZip}
                        onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                        placeholder="12345"
                        className="h-12 rounded-xl border-gray-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="p-8 bg-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">
                      {donationType === 'monthly' ? 'Monthly donation' : 'One-time donation'}
                    </p>
                    <p className="text-3xl font-semibold text-[#1e3a5f]">
                      ${amount ? amount.toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing || !amount}
                  className="w-full h-14 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-xl text-lg font-medium transition-all"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Complete Donation
                      <Heart className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Your donation is tax-deductible. A receipt will be emailed to you.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  )
}
