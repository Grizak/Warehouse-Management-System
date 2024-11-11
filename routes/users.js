// routes/users.js
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { sendNotification } = require('../utils/notificationUtil');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({
      email,
      password
    });
    await user.save();
    
    sendNotification('UserCreation', 'A new user has been created', 'Admin')

    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const isValid = user.comparePassword(password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    res.send({ message: "Login successfull", accessToken, refreshToken });
  } catch (err) {
    console.error(err);
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
  }

  try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

      // Ensure the refresh token is still valid in the database
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
          return res.status(403).json({ error: "Invalid refresh token" });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });

      res.json({ accessToken: newAccessToken });
  } catch (error) {
      res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;

  try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (user && user.refreshToken === refreshToken) {
          user.refreshToken = null;
          await user.save();
          res.json({ message: "Logout successful" });
      } else {
          res.status(403).json({ error: "Invalid refresh token" });
      }
  } catch (error) {
      res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

module.exports = router;
