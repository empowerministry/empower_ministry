"use client"

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { CreditCard, Lock, Heart, Calendar, Gift, Loader2, Check, ArrowRight, Users, BookOpen, Globe } from 'lucide-react'
import { toast } from 'sonner'
import Footer from '../components/Footer'
import { useSearchParams } from 'next/navigation'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const presetAmounts = [25, 50, 100, 250, 500, 1000]

// Payment Form Component (uses Stripe hooks)
function PaymentForm({
  amount,
  donationType,
  formData,
  isAnonymous,
  onSuccess
}: {
  amount: number
  donationType: string
  formData: { firstName: string; lastName: string; email: string }
  isAnonymous: boolean
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    // redirect: 'if_required' keeps the donor on this page when no 3DS step
    // is needed. 3DS-required cards still redirect to return_url and the
    // existing useEffect on ?success=true handles the return.
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate?success=true`,
        payment_method_data: {
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
          },
        },
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'An error occurred')
      setIsProcessing(false)
      return
    }

    // After the early return on `error`, the PaymentIntentResult union narrows
    // and `paymentIntent` is guaranteed defined — plain `.` makes that intent
    // explicit and surfaces any future SDK type regression immediately.
    // 'succeeded' = card cleared synchronously.
    // 'processing' = async method (e.g. ACH); Stripe settles in background.
    if (
      paymentIntent.status === 'succeeded' ||
      paymentIntent.status === 'processing'
    ) {
      onSuccess()
    } else {
      // Unexpected non-error, non-success state. Re-enable the button so the
      // donor can retry. This should be rare (e.g. requires_action without
      // a redirect, which 'if_required' usually handles for us).
      setErrorMessage('Payment did not complete. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-8 border-b border-gray-100">
        <h2 className="sr-only">Payment method</h2>
        <PaymentElement options={{ layout: 'tabs' }} />
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMessage}
          </div>
        )}
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
            <span>Secured by Stripe</span>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="w-full h-14 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-xl text-lg font-medium transition-all"
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {donationType === 'monthly' ? 'Start Monthly Donation' : 'Complete Donation'}
              <Heart className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Your donation is tax-deductible. A receipt will be emailed to you.
        </p>
      </div>
    </form>
  )
}

function DonateContent() {
  const searchParams = useSearchParams()
  const [showForm, setShowForm] = useState(false)
  const [donationType, setDonationType] = useState('one-time')
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const amount = customAmount ? parseFloat(customAmount) : selectedAmount

  // Check for success/canceled status from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsComplete(true)
      toast.success('Thank you for your generous donation!')
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('Payment was canceled. Please try again.')
    }
  }, [searchParams])

  // Watchdog: if we have a clientSecret but the Element does not visibly
  // mount within 5s (e.g. ad-blocker, network failure, Stripe.js blocked),
  // surface a fallback message so the donor isn't stuck.
  const [stripeLoadFailed, setStripeLoadFailed] = useState(false)

  // Reset stripeLoadFailed when clientSecret changes (e.g. donor adjusts
  // amount or clicks Try Again). Per React docs, "adjust state on prop
  // change" runs during render — not in an effect — to avoid the
  // react-hooks/set-state-in-effect rule.
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [trackedClientSecret, setTrackedClientSecret] = useState(clientSecret)
  if (trackedClientSecret !== clientSecret) {
    setTrackedClientSecret(clientSecret)
    setStripeLoadFailed(false)
  }

  useEffect(() => {
    if (!clientSecret) return
    const timeoutId = setTimeout(() => {
      // Heuristic: if Stripe.js loaded, an iframe with name starting with
      // "__privateStripeFrame" will be present. If not, show fallback.
      const mounted = document.querySelector('iframe[name^="__privateStripeFrame"]')
      if (!mounted) {
        setStripeLoadFailed(true)
      }
    }, 10000) // 10s — covers slow connections; false positives would orphan
              // incomplete Subscriptions in Stripe for monthly donors.
    return () => clearTimeout(timeoutId)
  }, [clientSecret])

  // Create a PaymentIntent (one-time) or incomplete Subscription (monthly).
  // Both paths now return { clientSecret } and render the same Payment Element.
  const initializePayment = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoadingPayment(true)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          donationType,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          isAnonymous,
        }),
      })

      // Parse defensively — proxies and CDNs can return non-JSON bodies on
      // error pages, and we don't want a SyntaxError to swallow the
      // server's structured error message.
      let data: { clientSecret?: string; error?: string } = {}
      try {
        data = await response.json()
      } catch {
        // body wasn't JSON — leave data as {} and fall through to error handling
      }

      if (!response.ok || data.error) {
        toast.error(data.error || 'Could not initialize payment')
        setIsLoadingPayment(false)
        return
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        toast.error('Unexpected response from server')
      }
    } catch (error) {
      console.error('initializePayment failed:', error)
      const offline = typeof navigator !== 'undefined' && !navigator.onLine
      toast.error(
        offline
          ? 'You appear to be offline. Check your connection and try again.'
          : 'Failed to initialize payment. Please try again.'
      )
    }

    setIsLoadingPayment(false)
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
            Your donation has been received successfully.
          </p>
          <p className="text-[#64748b] mb-8">
            A confirmation email will be sent to you shortly.
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
                  onClick={() => setShowForm(true)}
                  className="bg-[#c9a227] hover:bg-[#b8922a] text-white h-14 px-10 rounded-xl text-lg font-medium"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Donate Now
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
            {/* Donation Type */}
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1e3a5f] mb-6">
                Choose Donation Type
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* One-Time Donation */}
                <button
                  type="button"
                  onClick={() => {
                    setDonationType("one-time")
                    setClientSecret(null)
                  }}
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
                  onClick={() => {
                    setDonationType("monthly")
                    setClientSecret(null)
                  }}
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
                      setClientSecret(null)
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
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setClientSecret(null)
                  }}
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
                  <Label className="text-sm text-gray-600 mb-2 block">First Name *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-12 rounded-xl border-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Last Name *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-12 rounded-xl border-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Email *</Label>
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

            {/* Payment Section */}
            {!clientSecret ? (
              // Show "Continue to Payment" button
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
                    <span>Secured by Stripe</span>
                  </div>
                </div>
                <Button
                  onClick={initializePayment}
                  disabled={isLoadingPayment || !amount}
                  className="w-full h-14 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-xl text-lg font-medium transition-all"
                >
                  {isLoadingPayment ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue to Payment
                      <CreditCard className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Your donation is tax-deductible. A receipt will be emailed to you.
                </p>
              </div>
            ) : stripeLoadFailed ? (
              <div className="p-8 bg-gray-50">
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                  We couldn&apos;t load the secure payment form. This is often
                  caused by an ad-blocker or network issue. Try disabling
                  extensions and reloading, or contact us for help.
                </div>
                <Button
                  onClick={() => {
                    setClientSecret(null)
                    setStripeLoadFailed(false)
                  }}
                  className="w-full h-14 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-xl text-lg font-medium"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              // Show Stripe Payment Element
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSizeBase: '16px',
                      fontWeightNormal: '400',
                      fontWeightMedium: '500',
                      borderRadius: '12px',
                      colorPrimary: '#c9a227',
                      colorText: '#1e3a5f',
                      colorTextSecondary: '#6b7280',
                      colorTextPlaceholder: '#9ca3af',
                      colorBackground: '#ffffff',
                      colorDanger: '#dc2626',
                      spacingUnit: '4px',
                      spacingGridRow: '16px',
                      spacingGridColumn: '16px',
                    },
                    rules: {
                      '.Label': {
                        color: '#4b5563',
                        fontSize: '14px',
                        fontWeight: '400',
                        marginBottom: '8px',
                      },
                      '.Input': {
                        padding: '12px 16px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'border-color 150ms, box-shadow 150ms',
                      },
                      '.Input:focus': {
                        borderColor: '#c9a227',
                        boxShadow: '0 0 0 3px rgba(201, 162, 39, 0.15)',
                        outline: 'none',
                      },
                      '.Input--invalid': {
                        borderColor: '#dc2626',
                      },
                      '.Tab': {
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px',
                      },
                      '.Tab:hover': {
                        borderColor: '#c9a227',
                        backgroundColor: 'rgba(201, 162, 39, 0.03)',
                      },
                      '.Tab--selected': {
                        borderColor: '#c9a227',
                        backgroundColor: 'rgba(201, 162, 39, 0.05)',
                      },
                      '.TabIcon--selected': {
                        fill: '#c9a227',
                      },
                      '.Error': {
                        color: '#dc2626',
                        fontSize: '14px',
                        marginTop: '4px',
                      },
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={amount}
                  donationType={donationType}
                  formData={formData}
                  isAnonymous={isAnonymous}
                  onSuccess={() => setIsComplete(true)}
                />
              </Elements>
            )}
          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  )
}

export default function Donate() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c9a227]" />
      </div>
    }>
      <DonateContent />
    </Suspense>
  )
}
