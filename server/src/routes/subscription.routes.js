import { Router } from 'express';
import { StripeService, SUBSCRIPTION_PLANS } from '../services/stripeService.js';
import { authenticateToken } from '../middleware/auth.js';
import { Database } from '../config/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get all subscription plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: SUBSCRIPTION_PLANS,
    message: 'Subscription plans retrieved successfully'
  });
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const user = req.user;

    const plan = StripeService.getPlanById(planId);
    if (!plan || plan.id === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const userData = await Database.getUserById(user.id);
      const customer = await StripeService.createCustomer(userData.email, userData.name);
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await Database.updateUser(user.id, { stripe_customer_id: customerId });
    }

    const successUrl = `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.CLIENT_URL}/subscription/cancel`;

    const session = await StripeService.createSubscription(
      customerId,
      plan.stripePriceId,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url },
      message: 'Checkout session created successfully'
    });
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create billing portal session
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No subscription found'
      });
    }

    const returnUrl = `${process.env.CLIENT_URL}/subscription`;
    const session = await StripeService.createPortalSession(user.stripeCustomerId, returnUrl);

    res.json({
      success: true,
      data: { url: session.url },
      message: 'Portal session created successfully'
    });
  } catch (error) {
    logger.error('Error creating portal session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portal session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current subscription status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        requestsUsed: user.subscription.requestsUsed,
        requestLimit: user.subscription.requestLimit,
        planDetails: StripeService.getPlanById(user.subscription.plan)
      },
      message: 'Subscription status retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = await StripeService.handleWebhook(req.body, signature);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        logger.info(`Subscription ${event.type}: ${subscription.id}`);
        
        // Find user by Stripe customer ID
        const user = await Database.getUserByEmail(subscription.customer);
        if (user) {
          // Get plan from price ID
          const plan = StripeService.getPlanByPriceId(subscription.items.data[0].price.id);
          if (plan) {
            // Update subscription in database
            await Database.updateSubscription(user.id, {
              plan: plan.id,
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000)
            });

            // Update usage tracking with new limits
            const currentMonth = Database.getCurrentMonth();
            const usage = await Database.getOrCreateUsageTracking(user.id, currentMonth);
            if (usage.request_limit !== Database.getRequestLimitForPlan(plan.id)) {
              await Database.updateUsageTracking(user.id, currentMonth, {
                request_limit: Database.getRequestLimitForPlan(plan.id)
              });
            }
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        logger.info(`Subscription cancelled: ${deletedSubscription.id}`);
        
        // Update subscription to free plan
        const cancelledSub = await Database.getSubscriptionByStripeId(deletedSubscription.id);
        if (cancelledSub) {
          await Database.updateSubscription(cancelledSub.user_id, {
            plan: 'free',
            status: 'cancelled',
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null
          });

          // Reset usage tracking to free limits
          const currentMonth = Database.getCurrentMonth();
          await Database.getOrCreateUsageTracking(cancelledSub.user_id, currentMonth);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        logger.info(`Payment succeeded: ${invoice.id}`);
        
        // Reset monthly usage on successful payment
        if (invoice.subscription) {
          const sub = await Database.getSubscriptionByStripeId(invoice.subscription);
          if (sub) {
            const currentMonth = Database.getCurrentMonth();
            await Database.resetMonthlyUsage(sub.user_id, currentMonth);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        logger.info(`Payment failed: ${failedInvoice.id}`);
        
        // Handle failed payment - could suspend account or send notification
        if (failedInvoice.subscription) {
          const sub = await Database.getSubscriptionByStripeId(failedInvoice.subscription);
          if (sub) {
            await Database.updateSubscription(sub.user_id, {
              status: 'past_due'
            });
          }
        }
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as subscriptionRoutes };