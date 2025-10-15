/**
 * Payment Routes
 * Handles Stripe payment operations
 */

const express = require('express');
const router = express.Router();
const { Payment } = require('../models');
const { Order, Invoice, User } = require('../models');
const {
  createCheckoutSession,
  createPaymentIntent,
  createRefund,
  getCheckoutSession,
  getPaymentIntent,
  verifyWebhookSignature
} = require('../config/stripe');

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create Stripe checkout session for order payment
 * @access  Private (Customer)
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find order
    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to user (add auth middleware check)
    // if (order.customer._id.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Create checkout session
    const session = await createCheckoutSession(order, order.customer);

    // Create payment record
    const payment = await Payment.create({
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      amount: order.total,
      currency: order.currency,
      status: 'pending',
      order: order._id,
      customer: order.customer._id,
      description: `Payment for Order ${order.orderNumber}`
    });

    // Update order
    order.payment = payment._id;
    order.paymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      payment: payment
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/payments/create-payment-intent
 * @desc    Create Stripe payment intent for invoice payment
 * @access  Private (Customer)
 */
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;

    // Find invoice
    const invoice = await Invoice.findById(invoiceId).populate('customer');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check payment amount
    const paymentAmount = amount || invoice.balance;
    if (paymentAmount > invoice.balance) {
      return res.status(400).json({ error: 'Payment amount exceeds invoice balance' });
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(invoice, invoice.customer, paymentAmount);

    // Create payment record
    const payment = await Payment.create({
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentAmount,
      currency: invoice.currency,
      status: 'pending',
      invoice: invoice._id,
      order: invoice.order,
      customer: invoice.customer._id,
      description: `Payment for Invoice ${invoice.invoiceNumber}`,
      receiptEmail: invoice.customer.email
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment: payment
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/payments/refund
 * @desc    Process refund for a payment
 * @access  Private (Admin)
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if refundable
    if (!payment.isRefundable()) {
      return res.status(400).json({ error: 'Payment is not refundable' });
    }

    // Create refund
    const refund = await createRefund(payment.stripePaymentIntentId, amount, reason);

    // Update payment
    payment.status = amount >= payment.amount ? 'refunded' : 'partially_refunded';
    payment.refundAmount = (payment.refundAmount || 0) + (amount || payment.amount);
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    await payment.save();

    // Update order if exists
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }

    res.json({
      success: true,
      refund: refund,
      payment: payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/payments/session/:sessionId
 * @desc    Get checkout session details
 * @access  Private
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await getCheckoutSession(sessionId);
    const payment = await Payment.findOne({ stripeSessionId: sessionId });

    res.json({
      success: true,
      session: session,
      payment: payment
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('customer', 'email profile')
      .populate('order', 'orderNumber total')
      .populate('invoice', 'invoiceNumber total');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      payment: payment
    });
  } catch (error) {
    console.error('Error retrieving payment:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/payments
 * @desc    List all payments (with filters)
 * @access  Private (Admin)
 */
router.get('/', async (req, res) => {
  try {
    const { status, customerId, orderId, invoiceId, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;
    if (orderId) filter.order = orderId;
    if (invoiceId) filter.invoice = invoiceId;

    const payments = await Payment.find(filter)
      .populate('customer', 'email profile')
      .populate('order', 'orderNumber')
      .populate('invoice', 'invoiceNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPayments: count
    });
  } catch (error) {
    console.error('Error listing payments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = verifyWebhookSignature(req.body, sig);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Webhook handlers
async function handleCheckoutSessionCompleted(session) {
  const payment = await Payment.findOne({ stripeSessionId: session.id });
  if (!payment) return;

  payment.status = 'succeeded';
  payment.succeededAt = new Date();
  payment.stripeChargeId = session.payment_intent;
  payment.webhookEvents.push({
    eventId: session.id,
    eventType: 'checkout.session.completed',
    data: session
  });
  await payment.save();

  // Update order
  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'Confirmed';
      order.timeline.push({
        status: 'Payment Received',
        at: new Date(),
        note: 'Payment completed successfully'
      });
      await order.save();
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (!payment) return;

  payment.status = 'succeeded';
  payment.succeededAt = new Date();
  payment.receiptUrl = paymentIntent.charges?.data[0]?.receipt_url;
  payment.paymentMethod = {
    type: paymentIntent.payment_method_types[0],
    last4: paymentIntent.charges?.data[0]?.payment_method_details?.card?.last4,
    brand: paymentIntent.charges?.data[0]?.payment_method_details?.card?.brand
  };
  payment.webhookEvents.push({
    eventId: paymentIntent.id,
    eventType: 'payment_intent.succeeded',
    data: paymentIntent
  });
  await payment.save();

  // Update invoice
  if (payment.invoice) {
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
      invoice.amountPaid += payment.amount;
      if (!invoice.payments.includes(payment._id)) {
        invoice.payments.push(payment._id);
      }
      
      if (invoice.amountPaid >= invoice.total) {
        invoice.status = 'Paid';
        invoice.paidAt = new Date();
      } else {
        invoice.status = 'Partially Paid';
      }

      invoice.timeline.push({
        status: invoice.status,
        at: new Date(),
        note: `Payment received: ${payment.amount} ${payment.currency}`
      });
      await invoice.save();
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (!payment) return;

  payment.status = 'failed';
  payment.failedAt = new Date();
  payment.errorCode = paymentIntent.last_payment_error?.code;
  payment.errorMessage = paymentIntent.last_payment_error?.message;
  payment.webhookEvents.push({
    eventId: paymentIntent.id,
    eventType: 'payment_intent.payment_failed',
    data: paymentIntent
  });
  await payment.save();

  // Update order
  if (payment.order) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'failed';
      await order.save();
    }
  }
}

async function handleChargeRefunded(charge) {
  const payment = await Payment.findOne({ stripeChargeId: charge.id });
  if (!payment) return;

  const refundAmount = charge.amount_refunded / 100;
  payment.refundAmount = refundAmount;
  payment.status = refundAmount >= payment.amount ? 'refunded' : 'partially_refunded';
  payment.refundedAt = new Date();
  payment.webhookEvents.push({
    eventId: charge.id,
    eventType: 'charge.refunded',
    data: charge
  });
  await payment.save();
}

module.exports = router;
