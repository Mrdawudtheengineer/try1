# 🤖 Minecraft AI Dashboard - v2.0

A **professional, fully-functional real-time monitoring and control dashboard** for an autonomous Minecraft AI bot. Built with **Node.js, Express, Socket.IO** (backend) and **React + Vite** (frontend).

## ✨ Features

### 🎮 Dashboard Tabs

#### **Overview Tab**
- **Stats Panel**: Real-time bot health, hunger, XP, and armor status
- **AI Panel**: Current AI goals, tasks, and decision-making state
- **Control Panel**: Direct bot control (forward, back, left, right, jump, sneak)
- **Map View**: Interactive visualization of bot location in the world
- **Inventory Panel**: Real-time inventory tracking (9-slot grid)
- **Performance Chart**: CPU, Memory, and Tick Rate monitoring with live graphs
- **Event Log**: Real-time streaming log of all bot/dashboard events

#### **💬 AI Chat Tab** (NEW!)
- **Functional AI Assistant** with full personality customization
- **Personality Modes**: Helpful, Aggressive, Cautious, Funny
- **Customizable Name**: Change the AI name (default: "Dawud")
- **Temperature Control**: Adjust AI creativity (0-1.0)
- **Command Detection**: Automatically detects and executes Minecraft commands
  - Movement: "go to 100 64 200"
  - Mining: "dig for diamonds", "start mining"
  - Farming: "farm", "grow crops"
  - Building: "build", "construct"
  - Combat: "fight", "attack", "combat"
  - Control: "pause", "stop", "resume", "continue"
- **OpenAI Integration**: Full GPT-3.5/GPT-4 support with context history
- **Live Message History**: With timestamps and avatars
- **Real-time Typing Indicator**: Shows when bot is thinking

#### **📋 Tasks & Goals Tab** (NEW!)
- Create, manage, and track tasks/goals
- **Priority Levels**: High (Red), Medium (Orange), Low (Blue)
- Task completion tracking and deletion
- Provides context for bot planning and decision-making
- Persistent in-session storage

#### **⚙️ Settings & Customization Tab** (NEW!)
- **Theme Control**: Dark, Light, Auto modes
- **Accent Color**: Beautiful color picker with hex input
- **Update Interval**: Control telemetry update frequency (100-5000ms)
- **Log Level**: Debug, Info, Warning, Error filtering
- **AI Temperature**: Fine-tune model creativity
- **AI Model Selection**: Choose between GPT-3.5, GPT-4, GPT-4 Turbo
- **Auto-Save**: Toggle automatic state saving
- **Notifications & Sound**: Enable/disable alerts
- **Import/Export Settings**: Save and restore configurations
- **Reset to Defaults**: One-click factory reset

### 📊 Real-time Telemetry (Every 500ms)
- Bot connection status and ping
- Position (X, Y, Z coordinates)
- Health, hunger, XP, armor levels
- Movement state and speed
- Inventory items and quantities
- Current AI goal and task
- Perception data (nearby entities, blocks)
- Performance metrics (CPU, memory, tick rate)

### 🔐 Security Features
- **Token-based Authentication**: API token required for access
- **Rate Limiting**: 60 requests per minute per IP
- **Session Management**: Secure session handling
- **WebSocket Authentication**: Token validation on connection

### 🎨 Professional UI Design
- **Dark Mode First**: Sleek dark theme with green accent (#00ff00)
- **Responsive Layout**: Adapts to desktop and tablet sizes
- **Smooth Animations**: Fade-in, slide-in, and hover effects
- **Color-coded Elements**: Status indicators, priority levels
- **Modern Typography**: Clean, readable fonts with proper hierarchy
- **Hover States**: Interactive feedback on all interactive elements
- **Custom Scrollbars**: Styled scrollbars matching theme

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Minecraft server (online or local)
- OpenAI API key (optional, for AI chat)

### Installation

```bash
cd minecraft-ai-bot

# Install dependencies
npm install

# Install dashboard UI dependencies
cd dashboard/ui
npm install
npm run build

# Go back to root
cd ../..
```

### Configuration

Create a `.env` file in the root directory:

```env
# Minecraft Server
MINECRAFT_HOST=stackables.aternos.me
MINECRAFT_PORT=39639
MINECRAFT_USERNAME=YourBotName
MINECRAFT_PASSWORD=your_password
MINECRAFT_VERSION=1.20.1

# OpenAI (optional, but recommended for full AI chat)
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Dashboard
DASHBOARD_PORT=3000
DASHBOARD_PASSWORD=admin123
DASHBOARD_API_TOKEN=your-secret-token

# Logging
LOG_LEVEL=info
```

### Running

**Start both bot and dashboard:**
```bash
npm run both
```

**Or separately:**
```bash
# Terminal 1: Bot
npm start

# Terminal 2: Dashboard
npm run dashboard
```

Then open **http://localhost:3000** in your browser.

## 📝 API Endpoints

### POST `/api/chat`
Send a message to the AI and get a response with optional command execution.

**Request:**
```json
{
  "message": "go to 100 64 200",
  "aiName": "Dawud",
  "personality": "helpful",
  "temperature": 0.7,
  "history": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alright, heading to 100, 64, 200!",
  "isCommand": true,
  "commandType": "force-task",
  "commandData": {
    "type": "move",
    "x": 100,
    "y": 64,
    "z": 200
  }
}
```

### WebSocket Events

**emit**: `telemetry` - Bot status update
**emit**: `chat` - Chat message
**emit**: `log` - Log entry
**on**: `control` - Bot movement control
**on**: `dashboard-command` - Bot commands (pause, resume, etc.)
**on**: `ai-command` - AI-generated commands

## 🎯 Commands

### Via Chat
- **Movement**: "go to x y z"
- **Mining**: "dig", "mine", "mine diamonds"
- **Farming**: "farm", "grow"
- **Building**: "build", "construct"
- **Combat**: "fight", "attack", "combat"
- **Control**: "pause", "stop", "resume", "continue"

### Via Control Panel
- Movement buttons (arrows + jump/sneak toggles)
- Direct Minecraft command execution

## 📈 Monitoring

The dashboard provides real-time insights into:
- **Bot Status**: Health, hunger, position, ping
- **Performance**: CPU usage, memory consumption, tick rate
- **Activity**: Current task, AI decisions, event log
- **Inventory**: Items and quantities
- **World**: Nearby entities, blocks, map view

## 🔧 Architecture

```
minecraft-ai-bot/
├── bot/                 # Bot core (Mineflayer)
│   ├── index.js        # Main bot loop + telemetry
│   ├── connection.js   # Minecraft server connection
│   ├── config.js       # Configuration
│   └── logger.js       # Logging
├── ai/                 # AI modules
│   ├── brain.js        # Decision making
│   ├── perception.js   # World perception
│   ├── memory.js       # State storage
│   └── ...
├── systems/            # Minecraft systems
│   ├── movement.js
│   ├── mining.js
│   ├── farming.js
│   └── ...
└── dashboard/          # Web dashboard
    ├── server.js       # Express + Socket.IO server
    ├── socket.js       # WebSocket handlers
    └── ui/             # React + Vite frontend
        ├── src/
        │   ├── App.jsx
        │   ├── components/
        │   │   ├── AIChat.jsx
        │   │   ├── TasksPanel.jsx
        │   │   ├── SettingsPanel.jsx
        │   │   └── ...
        │   └── styles.css
        └── index.html
```

## 🛠️ Customization

### Change Accent Color
In **Settings** → **Accent Color** or edit `styles.css`:
```css
--primary-color: #00ff00;
```

### Add New Dashboard Panels
Create a component in `dashboard/ui/src/components/`:
```jsx
export default function CustomPanel({ telemetry, onLog }) {
  return <div className="panel">Your content</div>
}
```

Then import and add to `App.jsx`.

### Modify AI Personality
Edit the system prompt in `dashboard/server.js` at line ~90.

## 🐛 Troubleshooting

**Dashboard not connecting**
- Ensure bot is running: `npm start`
- Check token in browser console localStorage
- Verify API token in `.env`

**AI chat not working**
- Check OpenAI API key is set and valid
- Check rate limiting isn't activated
- Look at dashboard logs: `tail -f dashboard.log`

**Bot disconnecting**
- Check Minecraft server is online
- Verify username/password are correct
- Check network connectivity

## 📚 Documentation

- **Mineflayer**: https://github.com/PrismarineJS/mineflayer
- **Express**: https://expressjs.com/
- **Socket.IO**: https://socket.io/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

## 📄 License

MIT

## 🙏 Credits

Built with ❤️ for Minecraft AI automation enthusiasts.

---

**Status**: ✅ Production Ready | **Version**: 2.0 | **Last Updated**: March 2026
