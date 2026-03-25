const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

const getSettings = () => ({
    host: (process.env.CSGO_SERVER_IP || '127.0.0.1').trim(),
    port: parseInt(process.env.CSGO_SERVER_PORT || '27015'),
    password: (process.env.CSGO_RCON_PASSWORD || 'rconpassword').trim(),
    serverPath: (process.env.CSGO_SERVER_PATH || '/home/csgo-server/server').trim()
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

// Get list of installed mods
router.get('/', (req, res) => {
    const settings = getSettings();
    const pluginsPath = path.join(settings.serverPath, 'csgo/addons/sourcemod/plugins');
    global.addLog(`[FILES] Checking plugins at: ${pluginsPath}`);
    
    if (!fs.existsSync(pluginsPath)) {
        global.addLog(`[FILES ERROR] Plugins directory not found at: ${pluginsPath}`);
        return res.json({ 
            message: 'SourceMod plugins directory not found', 
            path: pluginsPath,
            plugins: [] 
        });
    }
    const plugins = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.smx'));
    res.json({ plugins });
});

// Install mod from direct link
router.post('/install', async (req, res) => {
    const { url, fileName } = req.body;
    const settings = getSettings();
    const dest = path.join(settings.serverPath, 'csgo/addons/sourcemod/plugins', fileName);
    global.addLog(`[FILES] Installing mod from ${url} to ${dest}`);
    
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(dest);
        response.data.pipe(writer);
        writer.on('finish', () => {
            global.addLog(`[FILES] Mod installed: ${fileName}`);
            res.json({ message: 'Mod installed successfully' });
        });
        writer.on('error', (err) => {
            global.addLog(`[FILES ERROR] ${err.message}`);
            res.status(500).json({ message: 'Error writing mod file', error: err.message });
        });
    } catch (error) {
        global.addLog(`[FILES ERROR] ${error.message}`);
        res.status(500).json({ message: 'Error downloading mod', error: error.message });
    }
});

// Delete mod
router.delete('/:fileName', (req, res) => {
    const { fileName } = req.params;
    const settings = getSettings();
    const filePath = path.join(settings.serverPath, 'csgo/addons/sourcemod/plugins', fileName);
    global.addLog(`[FILES] Deleting mod at: ${filePath}`);
    
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        global.addLog(`[FILES] Mod deleted: ${fileName}`);
        res.json({ message: 'Mod deleted successfully' });
    } else {
        global.addLog(`[FILES ERROR] Mod not found: ${fileName}`);
        res.status(404).json({ message: 'Mod not found' });
    }
});

// Workshop map management
router.post('/workshop-map', async (req, res) => {
    const { workshop_id } = req.body;
    const settings = getSettings();
    global.addLog(`[RCON] Setting workshop map ${workshop_id} on ${settings.host}`);
    try {
        const rcon = await Rcon.connect({
            host: settings.host,
            port: settings.port,
            password: settings.password
        });
        const response = await rcon.send(`host_workshop_map ${workshop_id}`);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        global.addLog(`[RCON ERROR] ${error.message}`);
        res.status(500).json({ message: 'Error setting workshop map', error: error.message });
    }
});

module.exports = router;
