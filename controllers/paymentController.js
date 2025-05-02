const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const stripe = require('stripe')('your_stripe_secret_key');

const razorpay = new Razorpay({
  key_id: 'your_razorpay_key_id',
  key_secret: 'your_razorpay_secret_key',
});

const razorPayOrder = async (req, res) => {
  const { amount, currency, name, userId } = req.body;

  const options = {
    amount: amount * 100,
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);

    await Order.create({
      userId,
      name,
      amount,
      currency,
      paymentProvider: 'razorpay',
      providerOrderId: order.id,
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
};

const stripeOrder = async (req, res) => {
  const { amount, currency, name, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: name || 'Miner Purchase' },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    await Order.create({
      userId,
      minerName,
      amount,
      currency,
      paymentProvider: 'stripe',
      providerOrderId: session.id,
    });
    
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
};

module.exports = { razorPayOrder, stripeOrder };