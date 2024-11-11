// routes/inventory.js
const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const { verifyToken, verifyRole } = require('../middleware/auth');
const router = express.Router();
const { sendNotification } = require('../utils/notificationUtil');

// Add a new inventory item (Admin or Manager only)
router.post('/add', verifyToken, verifyRole(['Admin', 'Manager']), async (req, res) => {
    try {
        const { name, description, quantity, price } = req.body;

        const newItem = new InventoryItem({ name, description, quantity, price });
        await newItem.save();
        res.status(201).json({ message: 'Item added successfully', item: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View all inventory items (Any authenticated user)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const items = await InventoryItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View a single inventory item (Any authenticated user)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (item.quantity < 10) {
            sendNotification('LowStock', 'The item' + item.name + 'is running low on stock', 'Admin')
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an inventory item (Admin or Manager only)
router.put('/update/:id', verifyToken, verifyRole(['Admin', 'Manager']), async (req, res) => {
    try {
        const { name, description, quantity, price } = req.body;
        
        const updatedItem = await InventoryItem.findByIdAndUpdate(
            req.params.id,
            { name, description, quantity, price, updatedAt: Date.now() },
            { new: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an inventory item (Admin only)
router.delete('/delete/:id', verifyToken, verifyRole(['Admin']), async (req, res) => {
    try {
        const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
