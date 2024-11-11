// routes/notification.js
const express = require('express');
const Notification = require('../models/Notification');
const { verifyToken, verifyRole } = require('../middleware/auth');
const router = express.Router();

// Get unread notifications for a role
router.get('/unread', verifyToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientRole: req.user.role, isRead: false });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark a notification as read
router.put('/read/:id', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
