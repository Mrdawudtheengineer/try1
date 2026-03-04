# 🚀 Quick Start Guide

## In 5 Minutes

### 1. Install Dependencies
```bash
npm install
cd dashboard/ui && npm install && npm run build && cd ../..
```

### 2. Configure (Optional)
Create `.env`:
```env
MINECRAFT_USERNAME=bot-name
OPENAI_API_KEY=sk-your-key  # Optional but recommended
DASHBOARD_API_TOKEN=secret123
```

### 3. Run Everything
```bash
npm run both
```

### 4. Open Dashboard
Visit: **http://localhost:3000**

## First Steps in Dashboard

1. **Overview Tab**: Check bot status (health, position, tasks)
2. **AI Chat Tab**: Type "go to 100 64 200" to test movement
3. **Settings Tab**: Customize theme and AI personality
4. **Tasks Tab**: Create tasks for the bot to track

## Common Commands

| Command | Effect |
|---------|--------|
| "go to 100 64 200" | Bot moves to coordinates |
| "dig for diamonds" | Bot mines diamonds |
| "farm" | Bot tends crops |
| "build" | Bot starts construction |
| "fight" | Bot enters combat mode |
| "pause" | Bot stops all activities |
| "resume" | Bot continues |

## Troubleshooting Quick Links

**Bot won't connect?**
- Check Minecraft server is running
- Verify username/password in `.env`

**Dashboard blank?**
- Refresh browser (Ctrl+R)
- Check browser console for errors (F12)
- Restart dashboard: `npm run dashboard`

**AI not responding?**
- Add OpenAI API key to `.env`
- If OpenAI unavailable, bot uses rule-based responses

## Environment Variables Reference

| Variable | Default | Notes |
|----------|---------|-------|
| `MINECRAFT_HOST` | stackables.aternos.me | Minecraft server hostname |
| `MINECRAFT_PORT` | 39639 | Server port |
| `MINECRAFT_USERNAME` | Dawud | Bot username |
| `MINECRAFT_VERSION` | 1.20.1 | Game version |
| `OPENAI_API_KEY` | (empty) | For AI chat (optional) |
| `OPENAI_MODEL` | gpt-3.5-turbo | GPT model to use |
| `DASHBOARD_PORT` | 3000 | Web server port |
| `DASHBOARD_API_TOKEN` | changeme | WebSocket auth token |
| `LOG_LEVEL` | info | debug/info/warn/error |

## File Structure

```
minecraft-ai-bot/
├── bot/                # Bot core
│   └── index.js       # Main loop
├── dashboard/         # Web dashboard
│   ├── server.js      # API server
│   └── ui/            # React app
└── README_DASHBOARD.md  # Full docs
```

## Performance

- **Dashboard Updates**: Every 500ms
- **Bot Tick Rate**: Every 50ms
- **Memory Usage**: ~100MB (bot) + ~50MB (dashboard)
- **CPU**: < 5% on modern systems

## Next Steps

1. Read full docs: [README_DASHBOARD.md](README_DASHBOARD.md)
2. Customize AI personality in Settings
3. Add custom tasks in Tasks panel
4. Create a .env for your own server

Enjoy! 🎮✨
