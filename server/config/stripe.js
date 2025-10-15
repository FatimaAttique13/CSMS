/**
 * Stripe Configuration and Helper Functions
 * Handles Stripe payment integration for CSMS
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const STRIPE_CONFIG = {
  currency: 'SAR',
  paymentMethods: ['card'],
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:3000/checkout/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:3000/checkout/cancel',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};

/**
 * Create or retrieve Stripe customer
 */
async function getOrCreateStripeCustomer(user) {
  try {
    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      return customer;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName || user.email,
      phone: user.profile?.phone,
      metadata: {
        userId: user._id.toString(),
        role: user.role
      }
    });

    // Save Stripe customer ID to user
    user.stripeCustomerId = customer.id;
    await user.save();

    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create Stripe Checkout Session for order payment
 */
async function createCheckoutSession(order, user) {
  try {
    const customer = await getOrCreateStripeCustomer(user);

    const lineItems = order.items.map(item => ({
      price_data: {
        currency: STRIPE_CONFIG.currency.toLowerCase(),
        product_data: {
          name: item.name,
          description: `${item.quantity} ${item.unit}`,
        },
        unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add tax as a line item
    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency.toLowerCase(),
          product_data: {
            name: 'Tax (15%)',
            description: 'Value Added Tax',
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: STRIPE_CONFIG.paymentMethods,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${STRIPE_CONFIG.cancelUrl}?order_id=${order._id}`,
      client_reference_id: order._id.toString(),
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: user._id.toString()
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create Payment Intent for invoice payment
 */
async function createPaymentIntent(invoice, user, amount) {
  try {
    const customer = await getOrCreateStripeCustomer(user);

    const paymentAmount = amount || invoice.balance;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Convert to cents
      currency: STRIPE_CONFIG.currency.toLowerCase(),
      customer: customer.id,
      description: `Payment for Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.order.toString(),
        customerId: user._id.toString()
      },
      receipt_email: user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Process refund
 */
async function createRefund(paymentIntentId, amount, reason) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer'
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

/**
 * Retrieve Checkout Session
 */
async function getCheckoutSession(sessionId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    });
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}

/**
 * Retrieve Payment Intent
 */
async function getPaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method']
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}

/**
 * Verify Webhook Signature
 */
function verifyWebhookSignature(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}

/**
 * List customer payment methods
 */
async function listCustomerPaymentMethods(customerId) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return paymentMethods.data;
  } catch (error) {
    console.error('Error listing payment methods:', error);
    throw error;
  }
}

module.exports = {
  stripe,
  STRIPE_CONFIG,
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createPaymentIntent,
  createRefund,
  getCheckoutSession,
  getPaymentIntent,
  verifyWebhookSignature,
  listCustomerPaymentMethods
};
