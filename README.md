# Minecraft AI Bot

Autonomous Minecraft AI Bot platform built with Mineflayer and a modular AI architecture.

## Requirements
- Node.js v18+
- Minecraft Java Edition server (configured in .env)

## Installation
1. Clone repository
2. Copy `.env.example` to `.env` and fill in values (especially `OPENAI_API_KEY`)
3. Run `npm install`
4. Start bot: `npm run start`
5. Start dashboard: `npm run dashboard`

## Project Structure
- bot/: Core bot entry and modules
- ai/: AI brain, perception, memory, planner, learning and conversation
- systems/: Movement, combat, mining, farming, inventory, crafting, survival, builder
- dashboard/: Web dashboard server and static UI
- data/: Persistent JSON data

## Features
- Autonomous survival intelligence
- Perception and memory persistence
- OpenAI conversational integration
- Live dashboard with controls and viewer
- City builder (player command only)

## Troubleshooting
- Ensure Node.js v18+
- Set `OPENAI_API_KEY` in your `.env`
- Check `data/logs.json` for messages

## Coolboyplayz111-restarts
- He is my alt account
- reyan-ops is my third account
