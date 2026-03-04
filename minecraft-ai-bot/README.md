# 🤖 Minecraft AI Dashboard - v2.0

> **A professional, fully-functional real-time monitoring and control dashboard for an autonomous Minecraft AI bot.**

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]() [![Node.js](https://img.shields.io/badge/node-18%2B-green)]() [![License](https://img.shields.io/badge/license-MIT-blue)]()

## ✨ Highlights

- **🎯 Professional Dashboard** with real-time telemetry streaming
- **💬 Functional AI Chat** with personality customization and command detection  
- **📊 Live Monitoring** of bot health, position, inventory, tasks, and performance
- **🎮 Full Control Panel** for direct command execution
- **⚙️ Customizable Settings** for theme, AI behavior, and UI preferences
- **🔐 Secure** with token-based auth and rate limiting
- **📱 Responsive Design** that works on desktop and tablet
- **🚀 Production Ready** with proper error handling and logging

## 🚀 Quick Start (2 minutes)

```bash
# 1. Install
npm install && cd dashboard/ui && npm install && npm run build

# 2. Create .env (optional)
cat > .env << EOF
MINECRAFT_USERNAME=YourBotName
OPENAI_API_KEY=sk-your-key
DASHBOARD_API_TOKEN=secret123
EOF

# 3. Run
npm run both

# 4. Open browser
open http://localhost:3000
```

For detailed setup, see [QUICKSTART.md](QUICKSTART.md)

## 📺 Dashboard Features

### Overview Tab
- **Stats Panel**: Health, hunger, XP, armor
- **AI Panel**: Current goals and decision state
- **Map View**: Bot location visualization
- **Inventory**: Real-time item tracking
- **Performance**: CPU, memory, tick rate graphs
- **Event Log**: Live activity stream

### 💬 AI Chat Tab
- Conversational AI with OpenAI integration
- **Personality modes**: Helpful, Aggressive, Cautious, Funny
- **Command detection**: Auto-execute Minecraft commands
  - Movement: "go to 100 64 200"  
  - Mining: "dig for diamonds"
  - Farming: "farm", farming
  - Building: "build"
  - Combat: "fight"
  - Control: "pause", "resume"

### 📋 Tasks Tab
- Create and track tasks/goals
- Priority levels (High/Medium/Low)
- Task completion tracking

### ⚙️ Settings Tab
- **Theme**: Dark/Light/Auto modes
- **Colors**: Customize primary accent color
- **AI**: Adjust temperature and model
- **Import/Export**: Save configurations

## 🛠️ Technology Stack

**Backend**
- Node.js + Express
- Socket.IO (real-time telemetry)
- OpenAI API (AI chat)
- Mineflayer (Minecraft bot)

**Frontend**
- React 18 + Vite
- Modern CSS with CSS Variables
- Responsive design

## 📁 Project Structure

```
minecraft-ai-bot/
├── bot/                    # Bot core
│   ├── index.js           # Main loop + telemetry  
│   ├── connection.js      # Minecraft server
│   ├── config.js          # Configuration
│   └── logger.js          # Logging
├── ai/                     # AI modules
│   ├── brain.js           # Decision making
│   ├── perception.js      # World sensing
│   ├── memory.js          # State storage
│   └── ...
├── systems/                # Game systems
│   ├── movement.js
│   ├── mining.js
│   ├── farming.js
│   └── ...
├── dashboard/              # Web UI
│   ├── server.js          # Express API
│   ├── socket.js          # WebSocket
│   └── ui/                # React frontend
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   │   ├── AIChat.jsx ⭐ NEW
│       │   │   ├── TasksPanel.jsx ⭐ NEW  
│       │   │   ├── SettingsPanel.jsx ⭐ NEW
│       │   │   └── ...
│       │   └── styles.css
│       └── index.html
└── README_DASHBOARD.md     # Full documentation
```

## 🎯 Commands via AI Chat

| Command | Effect |
|---------|--------|
| `go to 100 64 200` | Move to coordinates |
| `dig for diamonds` | Mine diamonds |
| `farm` | Tend crops |
| `build` | Start construction |
| `fight` | Enter combat |
| `pause` | Stop activities |
| `resume` | Resume tasks |

## 📊 Telemetry

Real-time updates every 500ms:
- Bot status (connected, position, health)
- Inventory items
- AI current goal
- Performance metrics (CPU, RAM, tick rate)
- World perception (nearby entities)
- Event log entries

## 🔐 Security

- **Token-based WebSocket auth**
- **Rate limiting**: 60 requests/minute
- **Session management**
- **Config-based secrets**

## 🌍 API Endpoints

### POST `/api/chat`
AI chat with command execution
```json
{
  "message": "go to 100 64 200",
  "aiName": "Dawud",
  "personality": "helpful"
}
```

### WebSocket Events
- `telemetry`: Bot status updates
- `chat`: Chat messages  
- `log`: Event log entries
- `control`: Bot movement commands
- `dashboard-command`: Pause/resume/etc

## ⚙️ Configuration

Create `.env` file:
```env
MINECRAFT_HOST=server.example.com
MINECRAFT_PORT=25565
MINECRAFT_USERNAME=BotName
MINECRAFT_PASSWORD=password

OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo

DASHBOARD_PORT=3000
DASHBOARD_API_TOKEN=your-secret-token
LOG_LEVEL=info
```

## 📖 Full Documentation

See [README_DASHBOARD.md](README_DASHBOARD.md) for:
- Detailed feature documentation
- API reference
- Customization guide
- Troubleshooting
- Architecture details

See [QUICKSTART.md](QUICKSTART.md) for quick setup.

## 🐛 Troubleshooting

**Dashboard not loading?**
- Check bot is running: `npm start`  
- Clear browser cache (Ctrl+Shift+Delete)
- Check console errors (F12)

**AI not responding?**
- Add OpenAI API key to `.env`
- Check API key is valid
- Use rule-based responses as fallback

**Bot disconnecting?**
- Verify Minecraft server is online
- Check username/password
- Look at bot logs: `tail -f bot.log`

## 🤝 Contributing

Found a bug? Have an idea? Feel free to open an issue or PR!

## 📄 License

MIT - Feel free to use this project however you like!

## 🙏 Credits

Built with ❤️ using:
- [Mineflayer](https://github.com/PrismarineJS/mineflayer)
- [Express](https://expressjs.com)
- [Socket.IO](https://socket.io)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)

---

**Status**: ✅ Production Ready | **Version**: 2.0 | **Last Updated**: March 2026

[🚀 Quick Start](QUICKSTART.md) • [📖 Full Docs](README_DASHBOARD.md) • [🐛 Report Issues](https://github.com)
