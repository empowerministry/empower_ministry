# Cohesive On-Page Donation Flow — Design

**Date:** 2026-04-25
**Status:** Approved (pending user review of this written spec)
**Scope:** `app/donate/page.tsx`, `app/api/create-payment-intent/route.ts`

## Problem

The donation page already collects payments through Stripe, but the flow does not feel cohesive to the donor:

1. **Monthly donations redirect** to Stripe-hosted Checkout, leaving the EMG site entirely.
2. **One-time donations** use the embedded Payment Element, but `confirmPayment` does a full-page redirect to `/donate?success=true` even when no 3D Secure step is required — the page reloads, the URL flashes, the user briefly sees a loading state.
3. **The Payment Element** styles itself with Stripe defaults: input height, border color, focus ring, label spacing, and tab pill style do not match the donor-info inputs immediately above it. The card form looks like an iframe stitched onto the page, not part of the form.

Goal: a donor fills the form, clicks "Complete Donation", and lands on the success view without the page ever reloading or feeling like it left EMG branding — for both one-time and monthly donations.

## Approach

Use Stripe's **incomplete-subscription pattern** so that monthly donations produce the same `clientSecret` shape as one-time donations. Both donation types then share a single `<Elements>` + `<PaymentElement>` rendering path on the client. Add `redirect: 'if_required'` to `confirmPayment` so the success view renders inline. Expand the Stripe `appearance` API config (variables + rules) so the Payment Element visually matches the rest of the donate form.

This was chosen over two alternatives:

- **Embedded Stripe Checkout** (`ui_mode: 'embedded'`) — smallest server diff, but Checkout's iframe theming is too limited to match the donor-info inputs. Directly conflicts with the visual-cohesion goal.
- **SetupIntent + off-session charge** — collect card first, charge via subscription later. Two-step UX, more failure modes, no relevant upside.

## Non-goals (v1)

The following are intentionally out of scope. They are reasonable next steps but not required to ship this change.

- Stripe webhooks for server-side payment confirmation
- Custom email receipts via Resend (Stripe's automatic receipt email is sufficient for v1)
- Persisting donations to a database
- Donor self-service portal (cancel/update subscription)
- Year-end tax-receipt PDFs
- Admin dashboard
- Campaign-specific donations tied to `/projects`
- Stripe Customer reuse for returning donors

---

## Architecture

**Two files change. No new files. No new dependencies.**

### `app/api/create-payment-intent/route.ts`

Both branches converge on `{ clientSecret, donationType }`. The monthly branch swaps from `checkout.sessions.create` to `customers.create` + `subscriptions.create`.

**One-time branch** (minor change):

```ts
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
```

The only diff vs today: add `receipt_email` so Stripe sends its built-in receipt automatically (cheap reliability win, removes need for Resend in v1).

**Monthly branch** (replaces Checkout Session):

```ts
const customer = await stripe.customers.create({
  email,
  name: isAnonymous ? undefined : name,
  metadata: { isAnonymous: isAnonymous ? 'true' : 'false' },
})

const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Monthly Donation to Empower Ministry Group',
        description: isAnonymous
          ? 'Anonymous monthly donation'
          : `Monthly donation from ${name}`,
      },
      unit_amount: amountInCents,
      recurring: { interval: 'month' },
    },
  }],
  payment_behavior: 'default_incomplete',
  payment_settings: { save_default_payment_method: 'on_subscription' },
  expand: ['latest_invoice.payment_intent'],
  metadata: {
    donationType: 'monthly',
    donorName: isAnonymous ? 'Anonymous' : name,
    isAnonymous: isAnonymous ? 'true' : 'false',
  },
})

const invoice = subscription.latest_invoice as Stripe.Invoice
const intent = invoice.payment_intent as Stripe.PaymentIntent

return NextResponse.json({
  clientSecret: intent.client_secret,
  donationType: 'monthly',
  subscriptionId: subscription.id,
})
```

Key Stripe details:
- `payment_behavior: 'default_incomplete'` — the documented pattern for collecting payment on the front end. Subscription stays `incomplete` until the PaymentIntent succeeds, then auto-transitions to `active`.
- `save_default_payment_method: 'on_subscription'` — saves the card to the Customer so future months charge automatically.
- The Customer is always created with the donor's real email (Stripe needs it for receipts and dunning) even when `isAnonymous`. The flag is preserved in metadata.

**Validation hardening:**
- Existing `amount < 1` check stays. Add `amount > 1_000_000` upper bound to prevent typo'd subscriptions.
- Defensively validate `email` and `name` server-side (the route is public).

### `app/donate/page.tsx`

Single rendering path for both donation types. Delete the `data.url` redirect branch in `initializePayment` — both branches now set `clientSecret` and let `<Elements>` render.

**`confirmPayment` changes:**

```ts
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
  setErrorMessage(error.message ?? 'An error occurred')
  setIsProcessing(false)
} else if (
  paymentIntent?.status === 'succeeded' ||
  paymentIntent?.status === 'processing'
) {
  onSuccess()
}
```

The `redirect: 'if_required'` flag means most cards settle in-place and the inline success view renders directly — no page reload, no `?success=true` flash, no scroll jump. 3DS-required cards still redirect through the issuer and return to `/donate?success=true`; the existing `useEffect` reading `searchParams` handles that path unchanged.

`paymentIntent.status === 'processing'` is treated as success because async payment methods (US bank debits, certain wallets) settle later. The donor sees the thank-you screen; Stripe completes the charge in the background. A small fraction of `processing` payments later fail; without webhooks we will not surface those. Acceptable for v1.

**Button copy adjusts by donation type:** when `donationType === 'monthly'`, the submit button reads "Start Monthly Donation" instead of "Complete Donation".

**State stays as-is.** `donationType`, `selectedAmount` / `customAmount`, `formData`, `isAnonymous`, `clientSecret`, `isComplete`, `isLoadingPayment` all keep their roles. Existing reset rules still apply: changing donation type, preset amount, or custom amount calls `setClientSecret(null)`, which unmounts the Element and forces a fresh PI/subscription on the next "Continue to Payment" click. Orphaned PIs/subscriptions in Stripe expire harmlessly.

**Success state — two paths land on the same view:**
- **Inline path (new, primary):** `redirect: 'if_required'` returns success without bouncing → `onSuccess()` flips `isComplete` → "Thank You!" view renders. No URL change.
- **URL-param path (existing fallback):** 3DS-required cards redirect to `/donate?success=true` → existing `useEffect` flips `isComplete`.

Both render the same component.

---

## Visual cohesion (Stripe `appearance` API)

The card form must look like the same form as the donor-info inputs above it. Today's `appearance` only sets six variables — most of the visual personality (input height, border color, focus ring, label spacing, tab pill style) is still Stripe-default. Strategy: variables for design tokens, rules for specific Stripe nodes.

**Variables (broad design tokens, extracted from existing Tailwind values):**

```ts
variables: {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSizeBase: '16px',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  borderRadius: '12px',           // rounded-xl
  colorPrimary: '#c9a227',        // gold
  colorText: '#1e3a5f',           // navy
  colorTextSecondary: '#64748b',
  colorTextPlaceholder: '#9ca3af',
  colorBackground: '#ffffff',
  colorDanger: '#dc2626',
  spacingUnit: '4px',
  spacingGridRow: '16px',
  spacingGridColumn: '16px',
}
```

**Rules (the layer that actually makes inputs match):**

```ts
rules: {
  '.Label': {
    color: '#64748b', fontSize: '14px', fontWeight: '400', marginBottom: '8px',
  },
  '.Input': {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    height: '48px',                 // matches h-12 on donor-info inputs
    transition: 'border-color 150ms, box-shadow 150ms',
  },
  '.Input:focus': {
    borderColor: '#c9a227',
    boxShadow: '0 0 0 3px rgba(201, 162, 39, 0.15)',
    outline: 'none',
  },
  '.Input--invalid': { borderColor: '#dc2626' },
  '.Tab': {
    border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px',
  },
  '.Tab--selected': {
    borderColor: '#c9a227',
    backgroundColor: 'rgba(201, 162, 39, 0.05)',
  },
  '.TabIcon--selected': { fill: '#c9a227' },
  '.Error': {
    color: '#dc2626', fontSize: '14px', marginTop: '4px',
  },
}
```

**Layout: keep `layout: 'tabs'`.** Tabs surface Apple Pay / Google Pay / Card alongside each other, which helps trust and conversion. The rules above restyle the tabs into rounded-xl pills that match the rest of the form.

**Structural cleanup in the JSX:**
- Remove the separate "Payment Details" header in the Payment Element section. The tabs themselves already serve as the section header.
- Match section padding (`p-8`) and divider (`border-b border-gray-100`) to the donor-info section so the two sections feel like one continuous form rather than two stacked cards.

Result: name, email, card number, expiry, CVC all share the same height, border, radius, and focus ring. The Stripe iframe becomes invisible.

---

## Error handling

**Server-side:**
- Customer or Subscription creation failure → existing catch block returns `{ error, status: 500 }`. Surface a clean message; do not leak Stripe internals.
- Invalid amount → 400 (`< 1` already handled; add `> 1_000_000` upper bound).
- Missing required fields → 400 with a clear message. Defensive validation since the route is public.

**Client-side:**
- `confirmPayment` error → existing handler sets `errorMessage`, re-enables button. No change.
- Stripe load failure (ad-blocker, no network) → if `<Elements>` does not mount within ~5 s of having a `clientSecret`, show "Trouble loading payment form. Please disable ad blockers or try again." with a retry button.
- `initializePayment` network failure → distinguish offline vs server error in the toast so donors know whether to retry or contact EMG.
- Stale `clientSecret` (donor changes amount/type after Element mounts) → already handled by `setClientSecret(null)`. The same logic applies to the monthly path because both share the same `clientSecret` state.

**Edge cases:**
1. Mid-payment refresh — donor re-enters info, new PI/subscription is created, old ones expire. No fix.
2. 3DS — `redirect: 'if_required'` redirects through the issuer, returns to `/donate?success=true`. The same flow applies to subscriptions, since the first invoice's PaymentIntent is what `confirmPayment` is acting on. Manual verification with the 3DS test card is required during implementation.
3. Async payment methods — `processing` is treated as success (see above).
4. Double-submit — buttons already disable on `isLoading` / `isProcessing`. No idempotency keys needed for v1.
5. Subscription created but PI confirmation fails — subscription stays `incomplete` and auto-expires in ~24 h. Donor retries, new subscription is created.
6. Anonymous monthly donations — Customer record in Stripe exists with the donor's real email (required for receipts and dunning), `metadata.isAnonymous: 'true'` flags it for any future admin/export logic. Documented so it does not surprise EMG later.

---

## Testing

Manual verification with Stripe test cards:
- `4242 4242 4242 4242` — instant success, no 3DS. Verifies the inline-success path on both one-time and monthly.
- `4000 0025 0000 3155` — requires 3DS. Verifies the redirect-back URL-param success path on both donation types.
- `4000 0000 0000 9995` — declined. Verifies the in-form error message.

For each: check the Stripe Dashboard.
- One-time → a single PaymentIntent in `succeeded` state.
- Monthly → a Customer, a Subscription in `active` state, and the first invoice paid. Subscription `metadata` should include `donationType`, `donorName`, `isAnonymous`.

Visual verification:
- Donor-info inputs and Payment Element inputs share height, border, radius, and focus ring.
- Tab pills match the rest of the form's border-radius.
- No "Payment Details" duplicate header.
- No page reload between clicking submit and seeing "Thank You!" (for non-3DS cards).

---

## Out-of-scope follow-ups

After this ships, reasonable next steps in priority order:
1. Stripe webhooks → server-side payment confirmation, source of truth for receipts.
2. Persist donations to Supabase → donor history, export for accounting.
3. Custom Resend email receipts (replace Stripe's default once webhooks exist).
4. Donor portal for managing recurring donations.
5. Year-end tax-receipt PDFs.
