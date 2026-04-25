import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { amount, donationType, email, name, isAnonymous } = await request.json()

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Convert to cents
    const amountInCents = Math.round(amount * 100)

    if (donationType === 'monthly') {
      // For recurring donations, create a checkout session with subscription
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Donation to Empower Ministry Group',
                description: isAnonymous ? 'Anonymous monthly donation' : `Monthly donation from ${name}`,
              },
              unit_amount: amountInCents,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donate?canceled=true`,
        metadata: {
          donationType: 'monthly',
          isAnonymous: isAnonymous ? 'true' : 'false',
          donorName: isAnonymous ? 'Anonymous' : name,
        },
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    } else {
      // For one-time donations, create a PaymentIntent. Stripe sends its
      // built-in receipt automatically when receipt_email is set.
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        metadata: {
          donationType: 'one-time',
          isAnonymous: isAnonymous ? 'true' : 'false',
          donorName: isAnonymous ? 'Anonymous' : name,
          donorEmail: email,
        },
      })

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        donationType: 'one-time',
      })
    }
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Error creating payment' },
      { status: 500 }
    )
  }
}
