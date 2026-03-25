const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
    const providedPassword = (password || '').trim();

    if (providedPassword === adminPassword) {
        // We'll still send a "token" so the frontend doesn't break, 
        // but it's just the password itself now.
        return res.json({ token: adminPassword });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
