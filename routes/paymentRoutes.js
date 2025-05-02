const express = require('express');
const router = express.Router();
const { razorPayOrder, stripeOrder } = require('../controllers/paymentController');

router.post('/create-razorpay-order', razorPayOrder);
router.post('/create-stripe-order', stripeOrder);

module.exports = router;
