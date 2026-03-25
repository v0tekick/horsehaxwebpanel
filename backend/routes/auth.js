const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// For simplicity, we use a single admin account from .env
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 10);

router.post('/login', (req, res) => {
    const { password } = req.body;

    if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.json({ token });
    }

    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
