import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { amount, donationType, email, name, isAnonymous } = await request.json()

    if (typeof amount !== 'number' || amount < 1 || amount > 1_000_000) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (donationType !== 'monthly' && donationType !== 'one-time') {
      return NextResponse.json(
        { error: 'Invalid donation type' },
        { status: 400 }
      )
    }

    // Convert to cents
    const amountInCents = Math.round(amount * 100)

    if (donationType === 'monthly') {
      // For recurring donations, use the incomplete-subscription pattern so
      // the donor can confirm payment via the embedded Payment Element on
      // our own page (no Checkout redirect).
      const customer = await stripe.customers.create({
        email,
        name: isAnonymous ? undefined : name,
        metadata: { isAnonymous: isAnonymous ? 'true' : 'false' },
      })

      // Stripe's subscriptions.create requires an existing Product on
      // price_data.product (unlike Checkout Sessions, which accept inline
      // product_data). We create one Product per request — Stripe Dashboard
      // will show one Product per donor. The Product description carries
      // donor identity so each is distinguishable.
      const product = await stripe.products.create({
        name: 'Monthly Donation to Empower Ministry Group',
        description: isAnonymous
          ? 'Anonymous monthly donation'
          : `Monthly donation from ${name}`,
        metadata: {
          donationType: 'monthly',
          donorName: isAnonymous ? 'Anonymous' : name,
          isAnonymous: isAnonymous ? 'true' : 'false',
        },
      })

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: 'usd',
              product: product.id,
              unit_amount: amountInCents,
              recurring: { interval: 'month' },
            },
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.confirmation_secret'],
        metadata: {
          donationType: 'monthly',
          donorName: isAnonymous ? 'Anonymous' : name,
          isAnonymous: isAnonymous ? 'true' : 'false',
        },
      })

      // Stripe's typings allow `latest_invoice` to be a string (the invoice
      // ID, if expansion silently failed), null, or an expanded Invoice. We
      // need it to be an object before the intersection cast below is sound.
      if (
        typeof subscription.latest_invoice !== 'object' ||
        subscription.latest_invoice === null
      ) {
        console.error('Subscription latest_invoice was not expanded', {
          subscriptionId: subscription.id,
          latestInvoiceType: typeof subscription.latest_invoice,
        })
        return NextResponse.json(
          { error: 'Could not initialize subscription payment' },
          { status: 500 }
        )
      }

      // In Stripe SDK v20 with the default API version, the first invoice's
      // PaymentIntent client_secret lives at `latest_invoice.confirmation_secret`
      // (not at `latest_invoice.payment_intent` as in older API versions).
      // The Stripe TS types do not yet include this field; the intersection
      // assertion bridges the gap.
      const invoice = subscription.latest_invoice as Stripe.Invoice & {
        confirmation_secret: { client_secret: string; type: string } | null
      }
      const clientSecret = invoice.confirmation_secret?.client_secret ?? null

      if (!clientSecret) {
        console.error('Subscription invoice has no confirmation_secret', {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
        })
        return NextResponse.json(
          { error: 'Could not initialize subscription payment' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        clientSecret,
        donationType: 'monthly',
        subscriptionId: subscription.id,
      })
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
