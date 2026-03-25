const path = require('path');
// Move dotenv to the very top and force load from absolute path
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const modRoutes = require('./routes/mods');

// Self-check for configuration
console.log('--- SERVER STARTUP SELF-CHECK ---');
if (process.env.WEB_LOGIN && process.env.WEB_PASSWORD) {
    console.log(`[CONFIG] WEB_LOGIN: ${process.env.WEB_LOGIN}`);
    console.log(`[CONFIG] WEB_PASSWORD: ${process.env.WEB_PASSWORD.length} chars`);
} else {
    console.warn('[CONFIG] CRITICAL ERROR: WEB_LOGIN or WEB_PASSWORD is NOT loaded from .env!');
}
if (process.env.JWT_SECRET) {
    console.log('[CONFIG] JWT_SECRET is loaded');
}
console.log('---------------------------------');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/mods', modRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*path', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
