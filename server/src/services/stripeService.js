import Stripe from 'stripe';
import { logger } from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 AI recipe generations per month',
      'Basic nutrition analysis',
      'Limited chat assistant'
    ],
    stripePriceId: '',
    requestLimit: 5
  },
  {
    id: 'basic',
    name: 'Basic Chef',
    price: 9.99,
    interval: 'month',
    features: [
      '50 AI recipe generations per month',
      'Full nutrition analysis with health scores',
      'Ingredient substitutions',
      'Unlimited chat assistant',
      'Basic meal planning (7 days)'
    ],
    stripePriceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    requestLimit: 50
  },
  {
    id: 'pro',
    name: 'Pro Chef',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited AI recipe generations',
      'Advanced nutrition analysis',
      'Smart meal planning (30 days)',
      'Image recipe analysis',
      'Priority chat support',
      'Custom dietary preferences',
      'Shopping list optimization'
    ],
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    requestLimit: -1 // Unlimited
  },
  {
    id: 'pro_yearly',
    name: 'Pro Chef (Yearly)',
    price: 199.99,
    interval: 'year',
    features: [
      'Unlimited AI recipe generations',
      'Advanced nutrition analysis',
      'Smart meal planning (30 days)',
      'Image recipe analysis',
      'Priority chat support',
      'Custom dietary preferences',
      'Shopping list optimization',
      '2 months free!'
    ],
    stripePriceId: 'price_pro_yearly', // Replace with actual Stripe price ID
    requestLimit: -1 // Unlimited
  }
];

export class StripeService {
  static async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      
      logger.info(`Created Stripe customer: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  static async createSubscription(customerId, priceId, successUrl, cancelUrl) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      logger.info(`Created checkout session: ${session.id}`);
      return session;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  static async createPortalSession(customerId, returnUrl) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info(`Created portal session for customer: ${customerId}`);
      return session;
    } catch (error) {
      logger.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  static async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  static async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      logger.info(`Cancelled subscription: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  static async handleWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      logger.info(`Received webhook event: ${event.type}`);
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  static getPlanByPriceId(priceId) {
    return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId) || null;
  }

  static getPlanById(planId) {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null;
  }
}