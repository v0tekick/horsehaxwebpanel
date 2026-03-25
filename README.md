# CS:GO Web Control Panel

A modern, web-based management interface for Counter-Strike: Global Offensive servers running on Ubuntu.

## Features

- **🔐 Secure Access**: Simplified login system with `WEB_LOGIN` and `WEB_PASSWORD`.
- **📊 System Logs**: Real-time telemetry to debug server connections and commands.
- **✨ Modern UI**: Glassmorphism aesthetic with smooth `framer-motion` animations.
- **👥 Player Management**: Interactive list with Kick/Ban capabilities and AI/Bot detection.
- **💻 Interactive Console**: Direct RCON interface with server command history.
- **🗺️ Map Control**: Mission Control panel for official map rotation and Workshop deployment.
- **🔌 SourceMod Manager**: Matrix view for managing plugins and direct `.smx` installations.

---

## 🚀 Prerequisites

Before you begin, ensure you have the following installed on your Ubuntu server:

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **CS:GO Server** with RCON enabled (`rcon_password "your_password"` in `server.cfg`)

### Installing Node.js on Ubuntu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 🛠️ Installation

1. **Clone the repository** (or copy the files):
   ```bash
   cd /path/to/hxonlineweb
   ```

2. **Install Root Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies & Build**:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

---

## ⚙️ Configuration

### Backend Setup
Edit the `backend/.env` file to configure your server connection:

```env
PORT=5000
WEB_LOGIN=your_web_username
WEB_PASSWORD=your_web_password
```
# CS:GO Server Details
CSGO_SERVER_IP=127.0.0.1
CSGO_SERVER_PORT=27015
CSGO_RCON_PASSWORD=your_rcon_password

# Path to your CS:GO installation (required for SourceMod management)
CSGO_SERVER_PATH=/home/csgo-server/server
```

---

## 🔄 How to Update

To properly apply new updates (including the latest UI redesign):

1. **Pull latest changes**:
   ```bash
   git pull
   ```

2. **Update dependencies**:
   ```bash
   # Root
   npm install
   # Backend
   cd backend && npm install
   # Frontend
   cd ../frontend && npm install
   ```

3. **Rebuild the Frontend**:
   ```bash
   npm run build
   ```

4. **Restart Backend** (if using PM2):
   ```bash
   pm2 restart csgo-panel
   ```

---

## 🏃 Running the Panel

### Development Mode
To run both the backend and frontend (with hot-reload):
```bash
npm run dev
```

### Production Mode
1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```
2. Start the backend:
   ```bash
   cd backend && npm start
   ```

*(Optional: Use `pm2` to keep the backend running in the background)*
```bash
sudo npm install -g pm2
pm2 start backend/index.js --name csgo-panel
```

---

## 📖 Usage Guide

- **Login**: Use the `ADMIN_PASSWORD` defined in your `.env`.
- **Dashboard**: View the current server state. Refreshes every 5 seconds.
- **Players**: Click the orange icon to **Kick** or red icon to **Ban**. Enter a reason in the top input field first.
- **Console**: Type any valid CS:GO command (e.g., `sv_cheats 1`, `say Hello!`) and press Enter.
- **Maps**: Select an official map to change level instantly, or enter a Workshop ID to load a custom map.
- **SourceMod**: 
  - Paste a direct `.smx` download link (e.g., from AlliedModders).
  - Provide a filename (e.g., `advertisements.smx`).
  - Click **Install Plugin**.

---

## ⚠️ Important Notes

- **Permissions**: Ensure the user running the Node.js backend has read/write permissions for the `CSGO_SERVER_PATH` directory to manage SourceMod plugins.
- **Firewall**: Ensure port `5000` (backend) and `5173` (frontend dev) or your Nginx port are open.
- **RCON**: If your CS:GO server is on a different machine, ensure `CSGO_SERVER_IP` is reachable and RCON is not firewalled.

---

## 📄 License
This project is open-source. Feel free to modify and extend it for your community!
