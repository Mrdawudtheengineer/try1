import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import StatsPanel from './components/StatsPanel'
import AIPanel from './components/AIPanel'
import LiveAIFeed from './components/LiveAIFeed'
import AIChat from './components/AIChat'
import BotChat from './components/BotChat'
import TasksPanel from './components/TasksPanel'
import SettingsPanel from './components/SettingsPanel'
import TogglesPanel from './components/TogglesPanel'
import InventoryPanel from './components/InventoryPanel'
import MapView from './components/MapView'
import EventLog from './components/EventLog'
import PerformanceChart from './components/PerformanceChart'
import ControlPanel from './components/ControlPanel'

export default function App() {
  // store telemetry per bot to support multiple bots
  const [botsTelemetry, setBotsTelemetry] = useState({})
  const [selectedBot, setSelectedBot] = useState(null)
  const [logs, setLogs] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [socket, setSocket] = useState(null) // shared telemetry/chat socket

  useEffect(() => {
    // ask for token
    let token = localStorage.getItem('apiToken');
    if (!token) {
      token = prompt('Enter API token (dashboard config)');
      if (token) localStorage.setItem('apiToken', token);
    }
    token = token || '';
    setApiToken(token);

    // create socket connection with token
    const s = io({ auth: { token } });
    setSocket(s);

    s.on('connect', () => {
      pushLog('Connected to dashboard socket')
    })

    s.on('telemetry', (data) => {
      // telemetry may come from different bots; use id if present
      const id = (data && data.bot && data.bot.id) ? data.bot.id : (data.bot && data.bot.username) || 'default';
      setBotsTelemetry(prev => {
        const next = { ...prev, [id]: data };
        return next;
      });
      setSelectedBot(prev => prev || id);
    })

    s.on('chat', (msg) => pushLog(`CHAT: ${msg}`))
    s.on('botStatus', (s) => pushLog('Bot status update'))
    s.on('log', (msg) => pushLog(msg))

    return () => { s.disconnect() }
  }, [])

  function pushLog(text) {
    setLogs(l => [...l, { ts: Date.now(), text }].slice(-500))
  }

  // compute currently selected telemetry object for panels
  const telemetry = selectedBot ? botsTelemetry[selectedBot] : null;

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">🤖 Minecraft AI Dashboard</div>
        <div className="status">
          {telemetry ? (
            <div>
              {Object.keys(botsTelemetry).length > 1 && (
                <select
                  className="bot-select"
                  value={selectedBot}
                  onChange={(e) => setSelectedBot(e.target.value)}
                >
                  {Object.entries(botsTelemetry).map(([id, t]) => (
                    <option key={id} value={id}>
                      {t.bot.username} {id !== t.bot.username ? `(${id})` : ''}
                    </option>
                  ))}
                </select>
              )}
              <strong>{telemetry.bot.username}</strong> @ {telemetry.bot.server} • {telemetry.bot.connected ? '🟢 Connected' : '🔴 Disconnected'} • Ping {telemetry.bot.ping}ms
            </div>
          ) : (<div>⏳ Connecting…</div>)}
        </div>
        <nav className="nav-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Chat</button>
          <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Tasks</button>
          <button className={`tab ${activeTab === 'toggles' ? 'active' : ''}`} onClick={() => setActiveTab('toggles')}>Toggles</button>
          <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="grid-2col">
              <section className="left-col">
                <StatsPanel telemetry={telemetry} />
                <AIPanel telemetry={telemetry} />
                <ControlPanel apiToken={apiToken} telemetry={telemetry} onLog={pushLog} />
              </section>
              <section className="right-col">
                <MapView telemetry={telemetry} />
                <InventoryPanel telemetry={telemetry} />
                <PerformanceChart telemetry={telemetry} />
                <LiveAIFeed telemetry={telemetry} />
              </section>
            </div>
            <aside className="event-log-section">
              <EventLog logs={logs} />
            </aside>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="tab-content">
            <div className="columns">
              <div className="column">
                <AIChat apiToken={apiToken} onLog={pushLog} />
              </div>
              <div className="column">
                <BotChat socket={socket} telemetry={telemetry} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tab-content">
            <div className="full-width">
              <TasksPanel telemetry={telemetry} onLog={pushLog} apiToken={apiToken} />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="full-width">
              <SettingsPanel onLog={pushLog} />
            </div>
          </div>
        )}

        {activeTab === 'toggles' && (
          <div className="tab-content">
            <div className="full-width">
              <TogglesPanel apiToken={apiToken} onLog={pushLog} />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-info">
          <span>Version 2.0</span>
          <span>•</span>
          <span>{logs.length} events</span>
          <span>•</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  )
}
