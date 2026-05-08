const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders  — place a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, address, meal, quantity, deliveryTime, notes } = req.body;

    if (!customerName || !phone || !address || !meal || !quantity || !deliveryTime) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const order = new Order({ customerName, phone, address, meal, quantity, deliveryTime, notes });
    await order.save();

    res.status(201).json({
      success: true,
      message: `Order placed! Your order number is ${order.orderNumber}. Delivery by drone is on its way! 🚁`,
      order: {
        orderNumber: order.orderNumber,
        meal: order.meal,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status,
        estimatedDelivery: deliveryTime,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/orders/track/:orderNumber  — customer can track their order
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber.toUpperCase() });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        meal: order.meal,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status,
        deliveryTime: order.deliveryTime,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/orders/meals  — get available meals with prices
router.get('/meals', (req, res) => {
  res.json({ success: true, meals: Order.MEALS });
});

module.exports = router;
