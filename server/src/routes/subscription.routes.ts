import { Router } from 'express';
import { StripeService, SUBSCRIPTION_PLANS } from '../services/stripeService.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
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
router.post('/create-checkout-session', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { planId } = req.body;
    const user = req.user!;

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
      const customer = await StripeService.createCustomer(user.email);
      customerId = customer.id;
      // Here you would update the user's stripeCustomerId in your database
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
router.post('/create-portal-session', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    
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
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    
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
    const signature = req.headers['stripe-signature'] as string;
    const event = await StripeService.handleWebhook(req.body, signature);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as any;
        logger.info(`Subscription ${event.type}: ${subscription.id}`);
        // Here you would update the user's subscription in your database
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as any;
        logger.info(`Subscription cancelled: ${deletedSubscription.id}`);
        // Here you would update the user's subscription status to cancelled
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any;
        logger.info(`Payment succeeded: ${invoice.id}`);
        // Here you would reset the user's monthly request count
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any;
        logger.info(`Payment failed: ${failedInvoice.id}`);
        // Here you would handle failed payment (send email, suspend account, etc.)
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