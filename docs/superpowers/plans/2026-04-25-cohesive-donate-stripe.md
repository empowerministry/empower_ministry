# Cohesive On-Page Donation Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make one-time and monthly donations both flow through a single embedded Stripe Payment Element on `app/donate/page.tsx` — no external redirects, no full-page reload on success, and visually cohesive with the donor-info inputs above.

**Architecture:** Convert the monthly branch in `app/api/create-payment-intent/route.ts` from `checkout.sessions.create` to `customers.create` + `subscriptions.create` with `payment_behavior: 'default_incomplete'`, returning the same `{ clientSecret }` shape as the one-time branch. On the client, collapse the two payment paths into one, add `redirect: 'if_required'` to `confirmPayment`, and expand the Stripe `appearance` API (variables + rules) so the Element matches the rest of the form.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind 4, `stripe` v20 (Node SDK), `@stripe/stripe-js` + `@stripe/react-stripe-js`, Sonner toasts.

**Spec:** `docs/superpowers/specs/2026-04-25-cohesive-donate-stripe-design.md`

**Testing approach:** This repo has no test framework installed (only `npm run lint` and `npm run build`). Per the spec, verification is manual against Stripe test cards. Each implementation task includes a build/type-check checkpoint, and Tasks 10–13 are dedicated manual verification phases with concrete checklists.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/api/create-payment-intent/route.ts` | Modify | Both branches return `{ clientSecret, donationType }`. Monthly creates Customer + Subscription instead of Checkout Session. |
| `app/donate/page.tsx` | Modify | Single `<Elements>`/`<PaymentElement>` rendering path for both donation types. `redirect: 'if_required'` on confirm. Expanded `appearance` config. JSX cleanup for cohesion. |

No new files. No new dependencies.

---

## Task 0: Pre-flight environment check

**Files:** none (verification only)

- [ ] **Step 1: Confirm required env vars are set**

Run:
```bash
test -n "$STRIPE_SECRET_KEY" && echo "STRIPE_SECRET_KEY: set" || echo "STRIPE_SECRET_KEY: MISSING"
test -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" && echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: set" || echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: MISSING"
test -n "$NEXT_PUBLIC_BASE_URL" && echo "NEXT_PUBLIC_BASE_URL: set" || echo "NEXT_PUBLIC_BASE_URL: MISSING (optional, defaults to localhost:3000)"
```

If running locally, also check `.env.local` exists:
```bash
ls -la /Users/davidkim/repos/empower_ministry/.env.local 2>/dev/null || echo ".env.local missing"
```

Expected: both Stripe keys must be set (use **test** keys, starting with `sk_test_` and `pk_test_`). If missing, stop and ask the user to set them before proceeding.

- [ ] **Step 2: Confirm clean working tree**

Run: `cd /Users/davidkim/repos/empower_ministry && git status`
Expected: working tree clean (or only the design doc / plan committed). If there are unrelated changes, stash or commit them first.

- [ ] **Step 3: Confirm build is currently green**

Run: `cd /Users/davidkim/repos/empower_ministry && npm run build`
Expected: build completes with no errors. This establishes a baseline — every subsequent task must keep the build green.

---

## Task 1: One-time PaymentIntent — add receipt_email and unified response shape

**Files:**
- Modify: `app/api/create-payment-intent/route.ts:53-69`

- [ ] **Step 1: Replace the one-time branch's PaymentIntent creation**

Open `app/api/create-payment-intent/route.ts`. Find the `else` block starting around line 52 (after the monthly Checkout Session branch). Replace its body:

**Before:**
```ts
    } else {
      // For one-time donations, create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          donationType: 'one-time',
          isAnonymous: isAnonymous ? 'true' : 'false',
          donorName: isAnonymous ? 'Anonymous' : name,
          donorEmail: email,
        },
      })

      return NextResponse.json({ clientSecret: paymentIntent.client_secret })
    }
```

**After:**
```ts
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
```

- [ ] **Step 2: Type-check + lint**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Smoke-test the endpoint**

Start the dev server in a background terminal: `npm run dev` (port 3000).

In a separate terminal:
```bash
curl -sX POST http://localhost:3000/api/create-payment-intent \
  -H 'Content-Type: application/json' \
  -d '{"amount":10,"donationType":"one-time","email":"test@example.com","name":"Test User","isAnonymous":false}' | head -c 500
```
Expected: JSON containing both `clientSecret` (string starting with `pi_..._secret_...`) and `"donationType":"one-time"`.

- [ ] **Step 4: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/api/create-payment-intent/route.ts
git commit -m "feat(donate): add receipt_email and donationType to one-time PI response"
```

---

## Task 2: Monthly — replace Checkout Session with embedded subscription

**Files:**
- Modify: `app/api/create-payment-intent/route.ts:20-51`

- [ ] **Step 1: Replace the monthly Checkout Session branch**

In the same file, find the `if (donationType === 'monthly')` block (starts around line 20). Replace its body:

**Before:**
```ts
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
```

**After:**
```ts
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
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          donationType: 'monthly',
          donorName: isAnonymous ? 'Anonymous' : name,
          isAnonymous: isAnonymous ? 'true' : 'false',
        },
      })

      // Stripe SDK v20 types do not include `payment_intent` on Invoice by
      // default (it's runtime-present via the `expand` above). The
      // intersection assertion bridges the gap.
      const invoice = subscription.latest_invoice as Stripe.Invoice & {
        payment_intent: Stripe.PaymentIntent | null
      }
      const intent = invoice.payment_intent as Stripe.PaymentIntent | null

      if (!intent?.client_secret) {
        console.error('Subscription has no PaymentIntent client_secret', {
          subscriptionId: subscription.id,
        })
        return NextResponse.json(
          { error: 'Could not initialize subscription payment' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        clientSecret: intent.client_secret,
        donationType: 'monthly',
        subscriptionId: subscription.id,
      })
    } else {
```

- [ ] **Step 2: Type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npx tsc --noEmit
```
Expected: no errors.

(`npm run lint` baseline has pre-existing errors in unrelated files — only verify the file you touched produces no new errors via `npx eslint app/api/create-payment-intent/route.ts`.)

The intersection-type assertion on `latest_invoice` (shown in Step 1's "After" block) is required for Stripe SDK v20 — that SDK version does not include `payment_intent` on `Invoice` by default; it's runtime-present via the `expand: ['latest_invoice.payment_intent']` array. The assertion bridges the runtime/type gap.

- [ ] **Step 3: Smoke-test the endpoint**

With dev server still running:
```bash
curl -sX POST http://localhost:3000/api/create-payment-intent \
  -H 'Content-Type: application/json' \
  -d '{"amount":10,"donationType":"monthly","email":"test+monthly@example.com","name":"Test Monthly","isAnonymous":false}' | head -c 500
```
Expected: JSON containing `clientSecret` (string starting with `pi_..._secret_...`), `"donationType":"monthly"`, and `subscriptionId` (string starting with `sub_`).

In the Stripe Dashboard (test mode), confirm: a new Customer was created, a Subscription is in `incomplete` status, and there is one open invoice with a PaymentIntent attached.

- [ ] **Step 4: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/api/create-payment-intent/route.ts
git commit -m "feat(donate): replace monthly Checkout with embedded subscription flow"
```

---

## Task 3: Server-side input validation hardening

**Files:**
- Modify: `app/api/create-payment-intent/route.ts:7-15`

- [ ] **Step 1: Replace the validation block at the top of the POST handler**

Find the validation block (right after `await request.json()`, around line 9). Replace:

**Before:**
```ts
    const { amount, donationType, email, name, isAnonymous } = await request.json()

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Convert to cents
    const amountInCents = Math.round(amount * 100)
```

**After:**
```ts
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
```

- [ ] **Step 2: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Smoke-test the new error paths**

```bash
# Missing email — should return 400
curl -sX POST http://localhost:3000/api/create-payment-intent \
  -H 'Content-Type: application/json' \
  -d '{"amount":10,"donationType":"one-time","email":"","name":"X","isAnonymous":false}'
# Expected: {"error":"Invalid email"}

# Amount over cap — should return 400
curl -sX POST http://localhost:3000/api/create-payment-intent \
  -H 'Content-Type: application/json' \
  -d '{"amount":2000000,"donationType":"one-time","email":"x@y.com","name":"X","isAnonymous":false}'
# Expected: {"error":"Invalid amount"}

# Bogus donationType — should return 400
curl -sX POST http://localhost:3000/api/create-payment-intent \
  -H 'Content-Type: application/json' \
  -d '{"amount":10,"donationType":"weekly","email":"x@y.com","name":"X","isAnonymous":false}'
# Expected: {"error":"Invalid donation type"}

# Valid request — should still succeed
curl -sX POST http://localhost:3000/api/create-payment-intent \
  -H 'Content-Type: application/json' \
  -d '{"amount":10,"donationType":"one-time","email":"x@y.com","name":"X","isAnonymous":false}' | head -c 200
# Expected: clientSecret + donationType
```

- [ ] **Step 4: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/api/create-payment-intent/route.ts
git commit -m "feat(donate): harden server-side validation in create-payment-intent"
```

---

## Task 4: Client — unify payment flow (drop the Checkout redirect branch)

**Files:**
- Modify: `app/donate/page.tsx:159-201`

- [ ] **Step 1: Replace `initializePayment`**

Find `initializePayment` in `DonateContent` (around line 160). Replace:

**Before:**
```tsx
  // Create payment intent when user is ready to pay
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

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        setIsLoadingPayment(false)
        return
      }

      if (donationType === 'monthly' && data.url) {
        // Redirect to Stripe Checkout for subscriptions
        window.location.href = data.url
      } else if (data.clientSecret) {
        // Use Payment Element for one-time donations
        setClientSecret(data.clientSecret)
      }
    } catch (error) {
      toast.error('Failed to initialize payment. Please try again.')
    }

    setIsLoadingPayment(false)
  }
```

**After:**
```tsx
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

      const data = await response.json()

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
      const offline = typeof navigator !== 'undefined' && !navigator.onLine
      toast.error(
        offline
          ? 'You appear to be offline. Check your connection and try again.'
          : 'Failed to initialize payment. Please try again.'
      )
    }

    setIsLoadingPayment(false)
  }
```

- [ ] **Step 2: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual sanity check**

In the running dev server, navigate to `http://localhost:3000/donate`. Click "Donate Now", fill in form, select "Monthly", click "Continue to Payment". The Stripe Payment Element should now render inline (no redirect). Don't submit yet — that's tested in later tasks.

- [ ] **Step 4: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/donate/page.tsx
git commit -m "feat(donate): unify one-time and monthly into single Payment Element flow"
```

---

## Task 5: Client — `redirect: 'if_required'` and inline success

**Files:**
- Modify: `app/donate/page.tsx:40-69` (inside `PaymentForm.handleSubmit`)

- [ ] **Step 1: Replace `handleSubmit` in `PaymentForm`**

Find `handleSubmit` inside `PaymentForm` (around line 40). Replace:

**Before:**
```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
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
    })

    if (error) {
      setErrorMessage(error.message || 'An error occurred')
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }
```

**After:**
```tsx
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

    // 'succeeded' = card cleared synchronously.
    // 'processing' = async method (e.g. ACH); Stripe settles in background.
    if (
      paymentIntent?.status === 'succeeded' ||
      paymentIntent?.status === 'processing'
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
```

- [ ] **Step 2: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/donate/page.tsx
git commit -m "feat(donate): add redirect: if_required and inline success handling"
```

---

## Task 6: Client — conditional submit button copy

**Files:**
- Modify: `app/donate/page.tsx:106-119` (inside `PaymentForm` JSX)

- [ ] **Step 1: Replace the submit button block**

Find the submit button inside `PaymentForm` (around line 106). Replace:

**Before:**
```tsx
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
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
```

**After:**
```tsx
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
```

- [ ] **Step 2: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/donate/page.tsx
git commit -m "feat(donate): differentiate submit copy for monthly vs one-time"
```

---

## Task 7: Client — expand Stripe `appearance` (variables + rules)

**Files:**
- Modify: `app/donate/page.tsx:565-581` (inside the `<Elements>` `options` prop)

- [ ] **Step 1: Replace the `appearance` object**

Find `<Elements stripe={stripePromise} options={{ clientSecret, appearance: ... }}>` (around line 565). Replace the `options` value:

**Before:**
```tsx
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#c9a227',
                      colorBackground: '#ffffff',
                      colorText: '#1e3a5f',
                      colorDanger: '#df1b41',
                      fontFamily: 'system-ui, sans-serif',
                      borderRadius: '12px',
                    },
                  },
                }}
              >
```

**After:**
```tsx
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
                      colorTextSecondary: '#64748b',
                      colorTextPlaceholder: '#9ca3af',
                      colorBackground: '#ffffff',
                      colorDanger: '#dc2626',
                      spacingUnit: '4px',
                      spacingGridRow: '16px',
                      spacingGridColumn: '16px',
                    },
                    rules: {
                      '.Label': {
                        color: '#64748b',
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
```

Note: Stripe's `.Input` rule does not accept a `height` property — Stripe controls input height via padding + line-height. The `padding: '12px 16px'` plus default 24px line-height yields ~48 px tall, matching `h-12` on the donor-info inputs above.

- [ ] **Step 2: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Visual sanity check**

Reload `/donate` in the browser. Begin a donation flow until the Payment Element renders. The card-number input should now have a 12-px corner radius, light gray border, and gold focus ring (visible when you click into it). Exact pixel-perfect comparison happens in Task 13.

- [ ] **Step 4: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/donate/page.tsx
git commit -m "style(donate): match Stripe Element appearance to site form styling"
```

---

## Task 8: Client — JSX cleanup for visual continuity

**Files:**
- Modify: `app/donate/page.tsx:71-89` (inside `PaymentForm` JSX, the Payment Details section)

- [ ] **Step 1: Remove the "Payment Details" header and align section padding**

Find the `<form onSubmit={handleSubmit}>` opening in `PaymentForm` (around line 72). Replace the first `<div>` block:

**Before:**
```tsx
    <form onSubmit={handleSubmit}>
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-[#1e3a5f]" />
          <h2 className="text-xl font-semibold text-[#1e3a5f]">Payment Details</h2>
        </div>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
```

**After:**
```tsx
    <form onSubmit={handleSubmit}>
      <div className="p-8 border-b border-gray-100">
        <PaymentElement options={{ layout: 'tabs' }} />
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
```

The `CreditCard` icon and `Heart` icon are still imported and used elsewhere (the section's submit button uses `Heart`, the pre-payment "Continue to Payment" section uses `CreditCard`). Do not remove those imports.

- [ ] **Step 2: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Visual sanity check**

Reload `/donate` and reach the Payment Element. The duplicate "Payment Details" header should be gone — the tabs themselves serve as the section heading. The Payment Element section should visually match the Donor Information section above it (same `p-8`, same hairline divider).

- [ ] **Step 4: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/donate/page.tsx
git commit -m "style(donate): remove duplicate Payment Details header for cohesion"
```

---

## Task 9: Client — Stripe load-failure fallback

**Files:**
- Modify: `app/donate/page.tsx` — add a watchdog effect inside `DonateContent`, render fallback when triggered.

- [ ] **Step 1: Add the watchdog state + effect**

Inside `DonateContent`, just after the existing `useEffect` that reads `searchParams` (around line 157), add:

```tsx
  // Watchdog: if we have a clientSecret but the Element does not visibly
  // mount within 5s (e.g. ad-blocker, network failure, Stripe.js blocked),
  // surface a fallback message so the donor isn't stuck.
  const [stripeLoadFailed, setStripeLoadFailed] = useState(false)

  useEffect(() => {
    if (!clientSecret) {
      setStripeLoadFailed(false)
      return
    }
    const timeoutId = setTimeout(() => {
      // Heuristic: if Stripe.js loaded, an iframe with name starting with
      // "__privateStripeFrame" will be present. If not, show fallback.
      const mounted = document.querySelector('iframe[name^="__privateStripeFrame"]')
      if (!mounted) {
        setStripeLoadFailed(true)
      }
    }, 5000)
    return () => clearTimeout(timeoutId)
  }, [clientSecret])
```

- [ ] **Step 2: Add the fallback branch in the existing conditional**

This is a surgical edit — do **not** rewrite the `<Elements>` block from Task 7. Just insert a new `stripeLoadFailed` branch into the existing ternary.

Find the line in `DonateContent` JSX that currently reads exactly:

```tsx
            ) : (
              // Show Stripe Payment Element
              <Elements
```

Replace those three lines (and only those three lines) with:

```tsx
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
```

Everything below that anchor — the `stripe={stripePromise}` prop, the full `options={{ clientSecret, appearance: { ... } }}` object from Task 7, the `<PaymentForm ...>` child, and the closing `</Elements>` — stays untouched.

- [ ] **Step 3: Lint + type-check**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && npm run lint && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Smoke check**

In the browser, navigate to `/donate` and start the flow. Without an ad-blocker, the Element should mount well before 5 s and the fallback should never appear. To force-test the fallback: in DevTools Network tab, block requests matching `js.stripe.com` and reload — after 5 s the fallback message should render with a "Try Again" button.

- [ ] **Step 5: Commit**

```bash
cd /Users/davidkim/repos/empower_ministry
git add app/donate/page.tsx
git commit -m "feat(donate): add fallback UI when Stripe.js fails to load"
```

---

## Task 10: Manual verification — happy path (4242 card, no 3DS)

**Files:** none (manual testing). Use Stripe **test mode** keys.

- [ ] **Step 1: Start fresh dev server**

```bash
cd /Users/davidkim/repos/empower_ministry && npm run dev
```
Open `http://localhost:3000/donate`.

- [ ] **Step 2: One-time donation, no 3DS**

Verification checklist:
1. Click "Donate Now". Form expands.
2. Leave "One-Time" selected. Pick `$50`. Fill First Name "Alice", Last Name "Test", Email `alice+test@example.com`.
3. Click "Continue to Payment". Stripe Payment Element renders inline (no redirect).
4. In the card tab, enter `4242 4242 4242 4242`, any future expiry (e.g. `12 / 30`), CVC `123`, ZIP `12345`.
5. Click "Complete Donation". Within ~1 s, the **inline** "Thank You!" view appears.
6. **Verify the URL did NOT change** — it should still be `/donate` (not `/donate?success=true`). This is the key behavior change from `redirect: 'if_required'`.
7. Confirm a green check icon and the message "Your donation has been received successfully."

In Stripe Dashboard (test mode) → Payments: a new $50 PaymentIntent in `succeeded` status, with `metadata.donationType = 'one-time'` and `donorEmail = alice+test@example.com`. Within a minute, Stripe sends a receipt email to that address.

- [ ] **Step 3: Monthly donation, no 3DS**

Reload `/donate`. Verification checklist:
1. Click "Donate Now". Click "Monthly". Pick `$25`. Fill First Name "Bob", Last Name "Monthly", Email `bob+monthly@example.com`.
2. Click "Continue to Payment". Stripe Payment Element renders inline (no redirect).
3. **Verify the submit button now reads "Start Monthly Donation"** (not "Complete Donation").
4. Use card `4242 4242 4242 4242`, any future expiry, CVC `123`.
5. Click "Start Monthly Donation". Inline "Thank You!" appears, URL unchanged.

In Stripe Dashboard:
- Customers → a new customer "Bob Monthly" with email `bob+monthly@example.com`.
- Subscriptions → status `active`, $25 / month.
- Subscription metadata includes `donationType: monthly`, `donorName: Bob Monthly`, `isAnonymous: false`.
- The first invoice is `paid`.

- [ ] **Step 4: Anonymous monthly**

Repeat Step 3 but check the "Make this donation anonymous" box. Verify in Stripe Dashboard:
- Customer is created (with the donor's real email — Stripe needs it for receipts).
- Customer's `metadata.isAnonymous = 'true'`.
- Subscription's `metadata.donorName = 'Anonymous'`.

- [ ] **Step 5: Document outcomes**

If any step fails, stop and fix the underlying code before proceeding to Task 11. If all pass, no commit needed (verification only).

---

## Task 11: Manual verification — 3DS path

**Files:** none (manual testing).

- [ ] **Step 1: One-time, 3DS-required card**

Reload `/donate`. Run a one-time `$10` donation using card `4000 0025 0000 3155` (3DS required).

When you click "Complete Donation":
1. The page redirects to a Stripe-hosted 3DS challenge page (this is expected — `if_required` triggers redirect when issuer requires it).
2. Click "Complete authentication" on the challenge page.
3. The page redirects back to `/donate?success=true`.
4. The existing `useEffect` fires `setIsComplete(true)` and the same "Thank You!" component renders.
5. A success toast appears: "Thank you for your generous donation!"

In Stripe Dashboard: PaymentIntent in `succeeded` status (not `requires_action`).

- [ ] **Step 2: Monthly, 3DS-required card**

Repeat with monthly $10. Same flow: 3DS challenge → return to `/donate?success=true` → "Thank You!" renders.

In Stripe Dashboard: Subscription in `active` status, first invoice `paid`.

- [ ] **Step 3: Document outcomes**

If the return URL fires but `isComplete` does not flip to true, suspect the existing `useEffect` reading `searchParams.get('success')`. That code is unchanged from before this plan; if it broke, something earlier removed it inadvertently — re-read `app/donate/page.tsx:148-158` and restore.

---

## Task 12: Manual verification — declined card

**Files:** none (manual testing).

- [ ] **Step 1: Declined one-time**

Reload `/donate`. Run a one-time $10 with card `4000 0000 0000 9995` (insufficient funds decline).

When you click "Complete Donation":
1. Inline error appears in the red error box: "Your card was declined." (or similar Stripe-provided message).
2. The button re-enables. The donor can correct the card and retry.
3. The URL stays at `/donate`. The "Thank You!" view does NOT appear.

- [ ] **Step 2: Declined monthly**

Same with monthly. Identical behavior — error inline, retryable. The Subscription remains in `incomplete` status in Stripe Dashboard. (It will auto-expire after 24 h if never paid, which is fine.)

- [ ] **Step 3: Document outcomes**

If the page reloads or shows a generic toast instead of the inline `errorMessage`, recheck Task 5 — the `redirect: 'if_required'` flag must be set, otherwise Stripe redirects on error too.

---

## Task 13: Visual cohesion verification

**Files:** none (manual visual check).

- [ ] **Step 1: Side-by-side comparison**

Reload `/donate` and reach the Payment Element. Open browser DevTools and inspect both:
- A donor-info `<input>` (e.g. First Name)
- A Stripe `.Input` (the iframe contains it; you can see it through the iframe boundary)

Confirm visually:
1. **Border radius** — both `12 px` (matches `rounded-xl`).
2. **Border color (resting)** — both light gray (`#e5e7eb` / `border-gray-200`).
3. **Border color (focused)** — both gold (`#c9a227`).
4. **Focus ring** — gold halo on both (donor-info uses Tailwind `ring`, Stripe uses `box-shadow`).
5. **Input height** — visually similar (~48 px). Stripe input height is determined by padding + line-height, so a small variance (1-2 px) is acceptable.
6. **Font** — both system-ui sans-serif.
7. **Label color and weight** — both look like the donor-info labels.

- [ ] **Step 2: Tab pill check**

Confirm the Payment Element tabs (Card, Apple Pay if eligible, etc.):
1. Pills have `12 px` border radius (not Stripe's default chip style).
2. Selected tab has gold border + faint gold tint background.
3. Selected tab icon is gold.

- [ ] **Step 3: Section continuity check**

Confirm visually:
1. No "Payment Details" header above the card form (gone since Task 8).
2. The Payment Element section uses the same `p-8` padding and hairline divider (`border-b border-gray-100`) as the Donor Information section above. The two sections feel like one continuous form.

- [ ] **Step 4: Mobile viewport check**

Open DevTools device toolbar, set viewport to iPhone 14 Pro (390 × 844). Walk through the flow:
1. Form fields stack correctly.
2. Payment Element scales down without horizontal overflow.
3. Tab labels do not truncate awkwardly.
4. Submit button remains full-width.

- [ ] **Step 5: Document outcomes**

If any visual issue is severe (e.g. tabs look broken, focus ring missing), revisit Task 7's `appearance` rules — that's where every visual change lives. No commit for this phase.

---

## Task 14: Final cleanup commit

**Files:** none (or any orphan changes from the verification phases).

- [ ] **Step 1: Verify clean tree and green build**

Run:
```bash
cd /Users/davidkim/repos/empower_ministry && git status && npm run build
```
Expected: working tree clean, build succeeds. If the build fails on a Stripe API surface that the SDK pinned to your account does not support (e.g. `payment_intent` rename), patch per the note in Task 2 Step 2 and amend.

- [ ] **Step 2: Verify the commit log**

Run: `git log --oneline -n 12`
Expected: ~9 commits since the spec commit, in this order:
1. `feat(donate): add receipt_email and donationType to one-time PI response`
2. `feat(donate): replace monthly Checkout with embedded subscription flow`
3. `feat(donate): harden server-side validation in create-payment-intent`
4. `feat(donate): unify one-time and monthly into single Payment Element flow`
5. `feat(donate): add redirect: if_required and inline success handling`
6. `feat(donate): differentiate submit copy for monthly vs one-time`
7. `style(donate): match Stripe Element appearance to site form styling`
8. `style(donate): remove duplicate Payment Details header for cohesion`
9. `feat(donate): add fallback UI when Stripe.js fails to load`

If a commit was missed, no action — just note it. The order matters more than completeness for review.

- [ ] **Step 3: Confirm spec coverage**

Re-read the spec (`docs/superpowers/specs/2026-04-25-cohesive-donate-stripe-design.md`) and confirm each of the three goals is addressed:
- **#1 No external redirect** → Task 2 (server) + Task 4 (client) remove the Checkout redirect.
- **#2 No page-reload flash** → Task 5 adds `redirect: 'if_required'` and inline success.
- **#3 Visual cohesion** → Tasks 7 + 8 expand `appearance` and clean up section structure.

Out-of-scope items from the spec (webhooks, DB persistence, custom Resend receipts, donor portal, tax-receipt PDFs, admin dashboard, campaign-specific donations, Customer reuse) are intentionally NOT implemented. Confirm none crept in.

- [ ] **Step 4: Done**

If all checks pass, the feature is complete. Inform the user, link to the design doc and the commit range, and offer to prepare a follow-up plan for the highest-priority out-of-scope item (Stripe webhooks → server-side payment confirmation).
