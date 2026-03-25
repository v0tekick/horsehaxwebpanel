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
        hosts.push('150.241.116.177');
    }

    // Try multiple protocols that might work for CS:GO
    // Note: In some versions, 'valve' is used, in others 'goldsrc' or 'source'
    const protocols = ['csgo', 'goldsrc']; 

    for (const host of hosts) {
        for (const proto of protocols) {
            global.addLog(`[QUERY] Attempting ${host}:${settings.port} (type: ${proto})`);
            try {
                const state = await GameDig.query({
                    type: proto,
                    host: host,
                    port: settings.port,
                    maxAttempts: 1, // Reduce attempts to speed up fallback
                    socketTimeout: 2000
                });
                global.addLog(`[QUERY SUCCESS] ${host}:${settings.port} using ${proto}`);
                return res.json(state);
            } catch (error) {
                global.addLog(`[QUERY ERROR] ${host} (${proto}): ${error.message}`);
            }
        }
    }

    // If UDP query fails, try a very simple RCON fallback to at least show the server is alive
    global.addLog(`[QUERY] UDP failed, attempting RCON status fallback...`);
    for (const host of hosts) {
        try {
            const rcon = await Rcon.connect({
                host: host,
                port: settings.port,
                password: settings.password,
                timeout: 5000
            });
            const status = await rcon.send('status');
            
            // Also try to get player list for the players tab
            let usersResponse = "";
            try {
                usersResponse = await rcon.send('users');
            } catch (e) {}
            
            await rcon.end();
            
            // Basic parsing of 'status' command
            // hostname: horsehax.ru | 12 slots | de_dust2
            const hostnameMatch = status.match(/hostname\s*:\s*(.+)/i);
            const mapMatch = status.match(/map\s*:\s*([^\s,]+)/i);
            const playersMatch = status.match(/players\s*:\s*(\d+)\s*humans/i);
            
            // Try to parse actual player names and bot status from 'status'
            const playerLines = status.split('\n').filter(line => line.trim().startsWith('#') && line.includes('"'));
            const players = playerLines.map(line => {
                const nameMatch = line.match(/"([^"]+)"/);
                const isBot = line.includes(' BOT ') || line.includes(' "BOT" ');
                return { 
                    name: nameMatch ? nameMatch[1] : "Unknown Player",
                    isBot: isBot
                };
            });

            const parsedHostname = hostnameMatch ? hostnameMatch[1].trim() : "CS:GO Server";

            global.addLog(`[RCON FALLBACK SUCCESS] ${host} | Name: ${parsedHostname} | Map: ${mapMatch ? mapMatch[1] : '?'} | Players: ${players.length}`);
            return res.json({
                name: parsedHostname,
                map: mapMatch ? mapMatch[1].trim() : "unknown",
                players: players,
                maxplayers: 64,
                raw: { rcon: true }
            });
        } catch (e) {
            global.addLog(`[RCON FALLBACK ERROR] ${host}: ${e.message}`);
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
                timeout: 10000
            });
            const response = await rcon.send(command);
            await rcon.end();
            global.addLog(`[RCON SUCCESS] ${host}:${settings.port} - Response received`);
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
