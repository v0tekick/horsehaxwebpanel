const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    // Compare using bcrypt
    if (bcrypt.compareSync(password, bcrypt.hashSync(adminPassword, 10))) {
        const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }

    // Fallback for plain text if bcrypt has issues with specific characters
    if (password === adminPassword) {
        const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
