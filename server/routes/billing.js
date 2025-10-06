import express from 'express';
import Stripe from 'stripe';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pricing plans
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Up to 1,000 data records',
      'Basic analytics',
      'Monthly reports',
      'Email support'
    ],
    limits: {
      dataRecords: 1000,
      aiQueries: 10
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: [
      'Up to 50,000 data records',
      'Advanced analytics',
      'Real-time insights',
      'AI-powered forecasting',
      'Weekly reports',
      'Priority support'
    ],
    limits: {
      dataRecords: 50000,
      aiQueries: 100
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: [
      'Unlimited data records',
      'Custom analytics',
      'Real-time insights',
      'Advanced AI features',
      'Custom integrations',
      'Daily reports',
      'Dedicated support'
    ],
    limits: {
      dataRecords: Infinity,
      aiQueries: Infinity
    }
  }
};

// Get pricing plans
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS });
});

// Get current subscription
router.get('/subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let subscription = null;

    if (user.subscription.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        );
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    res.json({
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        stripeSubscription: subscription
      },
      planDetails: PLANS[user.subscription.plan],
      usage: await getUserUsage(req.userId)
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!PLANS[planId] || planId === 'free') {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: PLANS[planId].priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing`,
      metadata: {
        userId: user._id.toString(),
        planId
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Server error creating checkout session' });
  }
});

// Handle successful checkout
router.post('/checkout-success', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user subscription
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      user.subscription.plan = session.metadata.planId;
      user.subscription.status = 'active';
      user.subscription.stripeSubscriptionId = subscription.id;
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await user.save();

      res.json({ 
        message: 'Subscription activated successfully',
        subscription: user.subscription
      });
    } else {
      res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Checkout success error:', error);
    res.status(500).json({ message: 'Server error processing checkout' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    user.subscription.status = 'canceled';
    await user.save();

    res.json({ message: 'Subscription will be canceled at the end of the current period' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error canceling subscription' });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Remove cancel_at_period_end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    user.subscription.status = 'active';
    await user.save();

    res.json({ message: 'Subscription reactivated successfully' });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Server error reactivating subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper functions
async function handleSubscriptionChange(subscription) {
  const user = await User.findOne({ 
    'subscription.stripeSubscriptionId': subscription.id 
  });

  if (user) {
    user.subscription.status = subscription.status;
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    if (subscription.status === 'canceled') {
      user.subscription.plan = 'free';
    }
    
    await user.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  const user = await User.findOne({ 
    'subscription.stripeCustomerId': invoice.customer 
  });

  if (user) {
    user.subscription.status = 'active';
    await user.save();
  }
}

async function handlePaymentFailed(invoice) {
  const user = await User.findOne({ 
    'subscription.stripeCustomerId': invoice.customer 
  });

  if (user) {
    user.subscription.status = 'past_due';
    await user.save();
  }
}

async function getUserUsage(userId) {
  // This would typically be implemented with proper usage tracking
  // For now, return mock data
  return {
    dataRecords: 2500,
    aiQueries: 25,
    lastUpdated: new Date()
  };
}

export default router;