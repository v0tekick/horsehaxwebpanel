const express = require('express');
const router = express.Router();
const { Rcon } = require('rcon-client');
const { GameDig } = require('gamedig');

const getSettings = () => ({
    host: (process.env.CSGO_SERVER_IP || '127.0.0.1').trim(),
    port: parseInt(process.env.CSGO_SERVER_PORT || '27015'),
    password: (process.env.CSGO_RCON_PASSWORD || 'rconpassword').trim()
});

router.use(authenticate);

// Get server status and players
router.get('/status', async (req, res) => {
    const settings = getSettings();
    console.log(`[QUERY] Attempting to query ${settings.host}:${settings.port}`);
    try {
        const state = await GameDig.query({
            type: 'csgo',
            host: settings.host,
            port: settings.port,
            maxAttempts: 3
        });
        res.json(state);
    } catch (error) {
        console.error(`[QUERY ERROR] ${error.message}`);
        res.status(500).json({ message: 'Error querying server status', error: error.message });
    }
});

// Execute RCON command
router.post('/command', async (req, res) => {
    const { command } = req.body;
    const settings = getSettings();
    console.log(`[RCON] Executing command on ${settings.host}:${settings.port}: ${command}`);
    try {
        const rcon = await Rcon.connect({
            host: settings.host,
            port: settings.port,
            password: settings.password
        });
        const response = await rcon.send(command);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        console.error(`[RCON ERROR] ${error.message}`);
        res.status(500).json({ message: 'Error executing RCON command', error: error.message });
    }
});

// Test connection route
router.get('/test-connection', async (req, res) => {
    const settings = getSettings();
    const results = {
        query: { status: 'testing', error: null },
        rcon: { status: 'testing', error: null }
    };

    try {
        await GameDig.query({ type: 'csgo', host: settings.host, port: settings.port });
        results.query.status = 'success';
    } catch (e) {
        results.query.status = 'failed';
        results.query.error = e.message;
    }

    try {
        const rcon = await Rcon.connect({ host: settings.host, port: settings.port, password: settings.password });
        await rcon.send('status');
        await rcon.end();
        results.rcon.status = 'success';
    } catch (e) {
        results.rcon.status = 'failed';
        results.rcon.error = e.message;
    }

    res.json(results);
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
