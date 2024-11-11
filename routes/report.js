// routes/report.js
const express = require('express');
const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth');
const router = express.Router();

// Report on low stock items (Admin or Manager only)
router.get('/lowStock', verifyToken, verifyRole(['Admin', 'Manager']), async (req, res) => {
    try {
        const lowStockItems = await InventoryItem.find({ quantity: { $lt: 10 } });
        res.json({ message: 'Low stock items', items: lowStockItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report on orders (Admin or Manager only)
router.get('/orders', verifyToken, verifyRole(['Admin', 'Manager']), async (req, res) => {
    try {
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        res.json({
            message: 'Order report',
            completedOrders,
            pendingOrders,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report on user roles (Admin only)
router.get('/userRoles', verifyToken, verifyRole(['Admin']), async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'Admin' });
        const managerCount = await User.countDocuments({ role: 'Manager' });
        const userCount = await User.countDocuments({ role: 'User' });

        res.json({
            message: 'User role report',
            adminCount,
            managerCount,
            userCount,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
