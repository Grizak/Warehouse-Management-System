// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['LowStock', 'OrderStatus', 'UserCreation'],
        required: true,
    },
    message: { type: String, required: true },
    recipientRole: {
        type: String,
        enum: ['Admin', 'Manager', 'Staff'],
        required: true,
    },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
