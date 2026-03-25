const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

const SERVER_PATH = process.env.CSGO_SERVER_PATH || '/home/csgo-server/server';
const CSGO_IP = process.env.CSGO_SERVER_IP || '127.0.0.1';
const CSGO_PORT = parseInt(process.env.CSGO_SERVER_PORT || '27015');
const CSGO_RCON_PASS = process.env.CSGO_RCON_PASSWORD || 'rconpassword';
const { Rcon } = require('rcon-client');

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

// Get list of installed mods
router.get('/', (req, res) => {
    const pluginsPath = path.join(SERVER_PATH, 'csgo/addons/sourcemod/plugins');
    if (!fs.existsSync(pluginsPath)) {
        return res.json({ message: 'SourceMod plugins directory not found', plugins: [] });
    }
    const plugins = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.smx'));
    res.json({ plugins });
});

// Install mod from direct link
router.post('/install', async (req, res) => {
    const { url, fileName } = req.body;
    const dest = path.join(SERVER_PATH, 'csgo/addons/sourcemod/plugins', fileName);
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });
        const writer = fs.createWriteStream(dest);
        response.data.pipe(writer);
        writer.on('finish', () => res.json({ message: 'Mod installed successfully' }));
        writer.on('error', (err) => res.status(500).json({ message: 'Error writing mod file', error: err.message }));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error downloading mod', error: error.message });
    }
});

// Delete mod
router.delete('/:fileName', (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(SERVER_PATH, 'csgo/addons/sourcemod/plugins', fileName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'Mod deleted successfully' });
    } else {
        res.status(404).json({ message: 'Mod not found' });
    }
});

// Workshop map management
router.post('/workshop-map', async (req, res) => {
    const { workshop_id } = req.body;
    try {
        const rcon = await Rcon.connect({
            host: CSGO_IP,
            port: CSGO_PORT,
            password: CSGO_RCON_PASS
        });
        const response = await rcon.send(`host_workshop_map ${workshop_id}`);
        await rcon.end();
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error setting workshop map' });
    }
});

module.exports = router;
