// routes/orders.js
const express = require('express');
const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');
const { verifyToken, verifyRole } = require('../middleware/auth');
const { sendNotification } = require('../utils/notificationUtil');
const router = express.Router();

// Create a new order (Authenticated user)
router.post('/create', verifyToken, async (req, res) => {
    try {
        const { customerName, products } = req.body;
        
        // Calculate total price and validate products
        let totalPrice = 0;
        for (const item of products) {
            const inventoryItem = await InventoryItem.findById(item.productId);
            if (!inventoryItem) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            totalPrice += inventoryItem.price * item.quantity;
        }

        const newOrder = new Order({ customerName, products, totalPrice });
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View all orders (Admin or Manager only)
router.get('/all', verifyToken, verifyRole(['Admin', 'Manager']), async (req, res) => {
    try {
        const orders = await Order.find().populate('products.productId');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View a single order (Any authenticated user can view their own orders)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('products.productId');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Only allow users to view their own orders
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an order status (Admin or Manager only)
router.put('/update/:id', verifyToken, verifyRole(['Admin', 'Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        sendNotification('OrderStatus', 'New order created', 'Admin')

        res.json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an order (Admin only)
router.delete('/delete/:id', verifyToken, verifyRole(['Admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
