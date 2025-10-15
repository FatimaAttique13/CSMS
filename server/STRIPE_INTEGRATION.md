# Stripe Payment Integration Guide

## 📦 Overview

This guide covers the complete Stripe payment integration for CSMS (Construction Supply Management System).

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd server
npm install stripe express cors jsonwebtoken
```

### Step 2: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or login
3. Navigate to **Developers** → **API keys**
4. Copy your **Publishable key** and **Secret key**
5. For testing, use **Test mode** keys

### Step 3: Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Stripe Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe URLs
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel
```

### Step 4: Update Database Schema

Run the setup script to add the Payment collection:

```bash
node scripts/setup_csms.js
```

## 📊 Database Changes

### New Collections

#### **payments** Collection
Tracks all Stripe payment transactions:
- Stripe identifiers (payment intent, charge, session IDs)
- Payment amount and status
- Links to orders and invoices
- Payment method details
- Refund information
- Webhook event history

### Updated Collections

#### **users** Collection
- Added: `stripeCustomerId` - Links user to Stripe customer

#### **orders** Collection
- Added: `payment` - Reference to Payment document
- Added: `paymentStatus` - enum: ['unpaid', 'pending', 'paid', 'failed', 'refunded']

#### **invoices** Collection
- Added: `payments` - Array of Payment references (supports multiple payments)

## 🔌 API Endpoints

### Create Checkout Session (for Orders)
```http
POST /api/payments/create-checkout-session
Content-Type: application/json

{
  "orderId": "67890abcdef..."
}

Response:
{
  "success": true,
  "sessionId": "cs_test_xxx",
  "sessionUrl": "https://checkout.stripe.com/pay/cs_test_xxx",
  "payment": { ... }
}
```

### Create Payment Intent (for Invoices)
```http
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "invoiceId": "67890abcdef...",
  "amount": 1500.00  // Optional, defaults to invoice balance
}

Response:
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "payment": { ... }
}
```

### Process Refund
```http
POST /api/payments/refund
Content-Type: application/json

{
  "paymentId": "67890abcdef...",
  "amount": 500.00,  // Optional, defaults to full refund
  "reason": "requested_by_customer"
}
```

### Get Payment Details
```http
GET /api/payments/:paymentId
```

### List Payments (Admin)
```http
GET /api/payments?status=succeeded&page=1&limit=20
```

### Webhook Endpoint
```http
POST /api/payments/webhook
```

## 🎯 Integration Flow

### Order Payment Flow (Checkout Session)

```
1. Customer places order
2. Frontend calls: POST /api/payments/create-checkout-session
3. Backend:
   - Creates Stripe customer (if not exists)
   - Creates checkout session
   - Creates payment record
   - Updates order.paymentStatus = 'pending'
4. Frontend redirects to session.url (Stripe Checkout page)
5. Customer completes payment
6. Stripe redirects to success_url
7. Stripe sends webhook: checkout.session.completed
8. Backend updates:
   - payment.status = 'succeeded'
   - order.paymentStatus = 'paid'
   - order.status = 'Confirmed'
```

### Invoice Payment Flow (Payment Intent)

```
1. Customer views invoice
2. Frontend calls: POST /api/payments/create-payment-intent
3. Backend:
   - Creates Stripe customer (if not exists)
   - Creates payment intent
   - Creates payment record
   - Returns clientSecret
4. Frontend uses Stripe.js to show payment form
5. Customer enters card details
6. Stripe processes payment
7. Stripe sends webhook: payment_intent.succeeded
8. Backend updates:
   - payment.status = 'succeeded'
   - invoice.amountPaid += amount
   - invoice.status = 'Paid' or 'Partially Paid'
```

## 🔔 Webhook Setup

### 1. Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/payments/webhook

# Copy the webhook signing secret (whsec_...)
# Add to .env as STRIPE_WEBHOOK_SECRET
```

### 2. Production Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-domain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret**
6. Add to production `.env` as `STRIPE_WEBHOOK_SECRET`

## 🎨 Frontend Integration

### Install Stripe.js

```bash
cd client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Checkout Session (Redirect to Stripe)

```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

async function handleCheckout(orderId) {
  try {
    // Create checkout session
    const response = await fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    
    const { sessionUrl } = await response.json();
    
    // Redirect to Stripe Checkout
    window.location.href = sessionUrl;
  } catch (error) {
    console.error('Checkout error:', error);
  }
}
```

### Payment Intent (Custom Form)

```javascript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

function PaymentForm({ invoiceId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    // Create payment intent
    const response = await fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId })
    });
    
    const { clientSecret } = await response.json();

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      console.error('Payment failed:', error);
    } else if (paymentIntent.status === 'succeeded') {
      console.log('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay Now</button>
    </form>
  );
}

// Wrap with Elements provider
function App() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm invoiceId="12345" />
    </Elements>
  );
}
```

## 💳 Test Cards

Use these test cards in **Test mode**:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0069` | Expired card |

**Expiry:** Any future date (e.g., 12/34)  
**CVV:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

## 🛡️ Security Best Practices

### Server-Side
- ✅ Never expose `STRIPE_SECRET_KEY` to frontend
- ✅ Always verify webhook signatures
- ✅ Validate amounts on server before creating payment
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on payment endpoints

### Client-Side
- ✅ Use `STRIPE_PUBLISHABLE_KEY` (safe to expose)
- ✅ Never send card details to your server
- ✅ Let Stripe.js handle card input (PCI compliant)
- ✅ Show loading states during payment
- ✅ Handle errors gracefully

## 📊 Admin Features

### Payment Analytics

```javascript
// Get payment statistics
const stats = await Payment.aggregate([
  {
    $match: {
      status: 'succeeded',
      createdAt: { $gte: new Date('2025-01-01') }
    }
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: '$amount' },
      totalTransactions: { $sum: 1 },
      averageTransaction: { $avg: '$amount' }
    }
  }
]);
```

### Refund Management

```javascript
// Admin refund endpoint
app.post('/api/admin/refunds', async (req, res) => {
  const { paymentId, amount, reason } = req.body;
  
  // Process refund via Stripe
  const response = await fetch('/api/payments/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, amount, reason })
  });
  
  const data = await response.json();
  res.json(data);
});
```

## 🐛 Troubleshooting

### Issue: "No such customer"
**Solution:** Run the setup script to add `stripeCustomerId` field to users.

### Issue: Webhook not receiving events
**Solution:** 
- Check webhook secret in `.env`
- Verify endpoint URL in Stripe Dashboard
- Use Stripe CLI for local testing

### Issue: "Invalid API key"
**Solution:** 
- Check `.env` file has correct keys
- Ensure using test keys in development
- Restart server after changing `.env`

### Issue: Payment succeeds but order not updated
**Solution:** 
- Check webhook is configured
- Verify webhook handler is working
- Check server logs for errors

## 🚀 Going Live

### Checklist

- [ ] Switch to live Stripe keys (remove `test` from keys)
- [ ] Update webhook endpoint to production URL
- [ ] Configure production success/cancel URLs
- [ ] Test with real card (small amount)
- [ ] Set up email notifications
- [ ] Configure proper error logging
- [ ] Implement fraud prevention
- [ ] Add invoice generation
- [ ] Set up automated receipts
- [ ] Configure Stripe radar rules

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**Need Help?** Check the [Stripe Support](https://support.stripe.com/) or [Community Forum](https://community.stripe.com/)
