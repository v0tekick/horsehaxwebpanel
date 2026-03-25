const express = require('express');
const router = express.Router();
const { Rcon } = require('rcon-client');
const { GameDig } = require('gamedig');

const CSGO_IP = process.env.CSGO_SERVER_IP || '127.0.0.1';
const CSGO_PORT = parseInt(process.env.CSGO_SERVER_PORT || '27015');
const CSGO_RCON_PASS = process.env.CSGO_RCON_PASSWORD || 'rconpassword';

// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

router.use(authenticate);

// Get server status and players
router.get('/status', async (req, res) => {
    try {
        const state = await GameDig.query({
            type: 'csgo',
            host: CSGO_IP,
            port: CSGO_PORT
        });
        res.json(state);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error querying server status' });
    }
});

// Execute RCON command
router.post('/command', async (req, res) => {
    const { command } = req.body;
    try {
        const rcon = await Rcon.connect({
            host: CSGO_IP,
            port: CSGO_PORT,
            password: CSGO_RCON_PASS
        });
        const response = await rcon.send(command);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error executing RCON command' });
    }
});

// Kick player
router.post('/kick', async (req, res) => {
    const { player_id, reason } = req.body;
    try {
        const rcon = await Rcon.connect({
            host: CSGO_IP,
            port: CSGO_PORT,
            password: CSGO_RCON_PASS
        });
        const response = await rcon.send(`kickid ${player_id} ${reason || 'Kicked by admin'}`);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error kicking player' });
    }
});

// Ban player
router.post('/ban', async (req, res) => {
    const { player_id, duration, reason } = req.body;
    try {
        const rcon = await Rcon.connect({
            host: CSGO_IP,
            port: CSGO_PORT,
            password: CSGO_RCON_PASS
        });
        // duration in minutes, 0 for permanent
        const response = await rcon.send(`banid ${duration || 0} ${player_id} ${reason || 'Banned by admin'}`);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error banning player' });
    }
});

// Change map
router.post('/change-map', async (req, res) => {
    const { map } = req.body;
    try {
        const rcon = await Rcon.connect({
            host: CSGO_IP,
            port: CSGO_PORT,
            password: CSGO_RCON_PASS
        });
        const response = await rcon.send(`changelevel ${map}`);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error changing map' });
    }
});

module.exports = router;
