// utils/notificationUtil.js
const Notification = require('../models/Notification');

async function sendNotification(type, message, recipientRole) {
    try {
        const notification = new Notification({
            type,
            message,
            recipientRole,
        });
        await notification.save();
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

module.exports = { sendNotification };
