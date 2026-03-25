const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', (req, res) => {
    const { login, password } = req.body;
    
    const envLogin = (process.env.WEB_LOGIN || 'admin').trim();
    const envPassword = (process.env.WEB_PASSWORD || 'admin').trim();
    
    const providedLogin = (login || '').trim();
    const providedPassword = (password || '').trim();

    console.log(`--- LOGIN ATTEMPT ---`);
    console.log(`Login: "${providedLogin}" vs "${envLogin}"`);
    console.log(`Pass:  "${providedPassword.length} chars" vs "${envPassword.length} chars"`);

    if (providedLogin === envLogin && providedPassword === envPassword) {
        console.log('--- LOGIN SUCCESS ---');
        // Simple token: login:password encoded in base64
        const token = Buffer.from(`${envLogin}:${envPassword}`).toString('base64');
        return res.json({ token });
    }

    console.log('--- LOGIN FAILED ---');
    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;
