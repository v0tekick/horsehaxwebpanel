const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
    const providedPassword = (password || '').trim();

    console.log(`Login attempt. Provided: ${providedPassword.length} chars, Expected: ${adminPassword.length} chars`);

    if (providedPassword === adminPassword) {
        console.log('Login successful');
        const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }

    console.log('Login failed: password mismatch');
    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
