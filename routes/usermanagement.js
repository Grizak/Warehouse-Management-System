// routes/user.js
const express = require('express');
const User = require('../models/User');
const { verifyToken, verifyRole } = require('../middleware/auth');
const router = express.Router();

// List all users (Admin only)
router.get('/all', verifyToken, verifyRole(['Admin']), async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords for security
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a user role (Admin only)
router.put('/updateRole/:id', verifyToken, verifyRole(['Admin']), async (req, res) => {
    try {
        const { role } = req.body;

        // Validate role input
        if (!['Admin', 'Manager', 'User'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User role updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user (Admin only)
router.delete('/delete/:id', verifyToken, verifyRole(['Admin']), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
