const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/server');
const modRoutes = require('./routes/mods');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/mods', modRoutes);

app.get('/', (req, res) => {
    res.send('CS:GO Control Panel API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
