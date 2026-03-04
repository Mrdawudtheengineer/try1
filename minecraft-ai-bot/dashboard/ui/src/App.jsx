import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import StatsPanel from './components/StatsPanel'
import AIPanel from './components/AIPanel'
import AIChat from './components/AIChat'
import TasksPanel from './components/TasksPanel'
import SettingsPanel from './components/SettingsPanel'
import InventoryPanel from './components/InventoryPanel'
import MapView from './components/MapView'
import EventLog from './components/EventLog'
import PerformanceChart from './components/PerformanceChart'
import ControlPanel from './components/ControlPanel'

export default function App() {
  const [telemetry, setTelemetry] = useState(null)
  const [logs, setLogs] = useState([])
  const [apiToken, setApiToken] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

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
    const socket = io({ auth: { token } });

    socket.on('connect', () => {
      pushLog('Connected to dashboard socket')
    })

    socket.on('telemetry', (data) => {
      setTelemetry(data)
    })

    socket.on('chat', (msg) => pushLog(`CHAT: ${msg}`))
    socket.on('botStatus', (s) => pushLog('Bot status update'))
    socket.on('log', (msg) => pushLog(msg))

    return () => { socket.disconnect() }
  }, [])

  function pushLog(text) {
    setLogs(l => [...l, { ts: Date.now(), text }].slice(-500))
  }

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="brand">🤖 Minecraft AI Dashboard</div>
        <div className="status">
          {telemetry ? (
            <div>
              <strong>{telemetry.bot.username}</strong> @ {telemetry.bot.server} • {telemetry.bot.connected ? '🟢 Connected' : '🔴 Disconnected'} • Ping {telemetry.bot.ping}ms
            </div>
          ) : (<div>⏳ Connecting…</div>)}
        </div>
        <nav className="nav-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Chat</button>
          <button className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>Tasks</button>
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
                <ControlPanel apiToken={apiToken} onLog={pushLog} />
              </section>
              <section className="right-col">
                <MapView telemetry={telemetry} />
                <InventoryPanel telemetry={telemetry} />
                <PerformanceChart telemetry={telemetry} />
              </section>
            </div>
            <aside className="event-log-section">
              <EventLog logs={logs} />
            </aside>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="tab-content">
            <div className="full-width">
              <AIChat apiToken={apiToken} onLog={pushLog} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tab-content">
            <div className="full-width">
              <TasksPanel telemetry={telemetry} onLog={pushLog} />
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
