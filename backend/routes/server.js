const express = require('express');
const router = express.Router();
const { Rcon } = require('rcon-client');
const { GameDig } = require('gamedig');

const getSettings = () => ({
    host: (process.env.CSGO_SERVER_IP || '127.0.0.1').trim(),
    port: parseInt(process.env.CSGO_SERVER_PORT || '27015'),
    password: (process.env.CSGO_RCON_PASSWORD || 'rconpassword').trim()
});

// Verify login:password from base64 token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    const envLogin = (process.env.WEB_LOGIN || 'admin').trim();
    const envPassword = (process.env.WEB_PASSWORD || 'admin').trim();
    const expectedToken = Buffer.from(`${envLogin}:${envPassword}`).toString('base64');

    if (!token || token !== expectedToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

router.use(authenticate);

// Get server status and players
router.get('/status', async (req, res) => {
    const settings = getSettings();
    const hosts = [settings.host];
    if (settings.host === '127.0.0.1') {
        // Fallback to public IP if loopback fails
        hosts.push('150.241.116.177');
    }

    for (const host of hosts) {
        global.addLog(`[QUERY] Attempting to query ${host}:${settings.port} (type: csgo)`);
        try {
            const state = await GameDig.query({
                type: 'csgo',
                host: host,
                port: settings.port,
                maxAttempts: 3,
                socketTimeout: 3000
            });
            global.addLog(`[QUERY SUCCESS] ${host}:${settings.port}`);
            return res.json(state);
        } catch (error) {
            global.addLog(`[QUERY ERROR] ${host} (csgo): ${error.message}`);
            
            // Try 'source' type as fallback
            global.addLog(`[QUERY] Attempting fallback query ${host}:${settings.port} (type: source)`);
            try {
                const state = await GameDig.query({
                    type: 'source',
                    host: host,
                    port: settings.port,
                    maxAttempts: 2,
                    socketTimeout: 2000
                });
                global.addLog(`[QUERY SUCCESS] ${host}:${settings.port} (fallback)`);
                return res.json(state);
            } catch (fallbackError) {
                global.addLog(`[QUERY ERROR] ${host} (source): ${fallbackError.message}`);
            }
        }
    }

    res.status(500).json({ message: 'Error querying server status from all IPs/protocols' });
});

// Execute RCON command
router.post('/command', async (req, res) => {
    const { command } = req.body;
    const settings = getSettings();
    const hosts = [settings.host];
    if (settings.host === '127.0.0.1') hosts.push('150.241.116.177');

    for (const host of hosts) {
        global.addLog(`[RCON] Attempting command on ${host}:${settings.port}: ${command}`);
        try {
            const rcon = await Rcon.connect({
                host: host,
                port: settings.port,
                password: settings.password,
                timeout: 5000
            });
            const response = await rcon.send(command);
            await rcon.end();
            global.addLog(`[RCON SUCCESS] ${host}:${settings.port}`);
            return res.json({ response });
        } catch (error) {
            global.addLog(`[RCON ERROR] ${host}:${settings.port}: ${error.message}`);
        }
    }
    
    res.status(500).json({ message: 'Error executing RCON command on all IPs' });
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
    const settings = getSettings();
    try {
        const rcon = await Rcon.connect({
            host: settings.host,
            port: settings.port,
            password: settings.password
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
    const settings = getSettings();
    try {
        const rcon = await Rcon.connect({
            host: settings.host,
            port: settings.port,
            password: settings.password
        });
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
    const settings = getSettings();
    try {
        const rcon = await Rcon.connect({
            host: settings.host,
            port: settings.port,
            password: settings.password
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
