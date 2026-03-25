const path = require('path');
// Move dotenv to the very top and force load from absolute path
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const modRoutes = require('./routes/mods');

// In-memory log storage
const serverLogs = [];
const addLog = (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    serverLogs.push(logEntry);
    if (serverLogs.length > 100) serverLogs.shift();
    console.log(logEntry);
};

// Global log utility for routes
global.addLog = addLog;

// Self-check for configuration
addLog('--- SERVER STARTUP SELF-CHECK ---');
if (process.env.WEB_LOGIN && process.env.WEB_PASSWORD) {
    addLog(`[CONFIG] WEB_LOGIN: ${process.env.WEB_LOGIN}`);
    addLog(`[CONFIG] WEB_PASSWORD is set`);
} else {
    addLog('[CONFIG] CRITICAL ERROR: WEB_LOGIN or WEB_PASSWORD is NOT loaded from .env!');
}
addLog('---------------------------------');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/mods', modRoutes);

// Log endpoint
app.get('/api/logs', (req, res) => {
    // Simple verify from token header
    const token = req.headers.authorization?.split(' ')[1];
    const envLogin = (process.env.WEB_LOGIN || 'admin').trim();
    const envPassword = (process.env.WEB_PASSWORD || 'admin').trim();
    const expectedToken = Buffer.from(`${envLogin}:${envPassword}`).toString('base64');

    if (!token || token !== expectedToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({ logs: serverLogs });
});

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
