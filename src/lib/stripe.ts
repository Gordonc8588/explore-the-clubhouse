import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js'
import Stripe from 'stripe'

let stripePromise: Promise<StripeClient | null> | null = null

export function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Only initialize Stripe on the server if the secret key is available
// This allows the build to succeed without the secret key set
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : (null as unknown as Stripe)
