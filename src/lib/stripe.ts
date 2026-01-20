import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js'
import Stripe from 'stripe'

let stripePromise: Promise<StripeClient | null> | null = null

export function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})
