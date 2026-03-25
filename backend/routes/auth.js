const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
    const { password } = req.body;
    
    // Get raw values and trimmed values
    const rawAdmin = process.env.ADMIN_PASSWORD || 'admin';
    const adminPassword = rawAdmin.trim();
    const providedPassword = (password || '').trim();

    // Log for debugging (using hex to see hidden chars)
    const adminHex = Buffer.from(adminPassword).toString('hex');
    const providedHex = Buffer.from(providedPassword).toString('hex');
    
    console.log('--- LOGIN DEBUG ---');
    console.log(`Expected (hex): ${adminHex}`);
    console.log(`Provided (hex): ${providedHex}`);
    console.log(`Match: ${providedPassword === adminPassword}`);
    console.log('-------------------');

    if (providedPassword === adminPassword) {
        const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
